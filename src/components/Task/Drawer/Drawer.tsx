import React, { ReactElement, useState } from 'react';
import {
  Theme,
  IconButton,
  Box,
  Container,
  Grid,
  Drawer,
  AppBar,
  Tab,
  Typography,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { AnimatePresence, motion } from 'framer-motion';
import Loading from '../../Loading';
import TaskStatus from '../Status';
import { Task } from '../../../../graphql/types.generated';
import { TaskFilter } from '../List/List';
import { useAccountListId } from '../../../hooks/useAccountListId';
import TaskDrawerForm from './Form';
import TaskDrawerContactList from './ContactList';
import TaskDrawerCommentList from './CommentList';
import TaskDrawerCompleteForm from './CompleteForm';
import { useGetTaskForTaskDrawerQuery } from './TaskDrawerTask.generated';

const useStyles = makeStyles((theme: Theme) => ({
  fixed: {
    position: 'fixed',
    top: 0,
    background: theme.palette.background.paper,
    zIndex: 1,
  },
  content: {
    marginTop: 120,
  },
  container: {
    padding: theme.spacing(2, 2),
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    flexGrow: 1,
  },
  tabPanel: {
    padding: 0,
  },
  paper: {
    width: 500,
    [theme.breakpoints.down('xs')]: {
      width: '100%',
    },
  },
}));

export interface TaskDrawerProps {
  taskId?: string;
  onClose?: () => void;
  showCompleteForm?: boolean;
  specificTab?: TaskDrawerTabsEnum;
  defaultValues?: Partial<Task>;
  filter?: TaskFilter;
  rowsPerPage?: number;
}

export enum TaskDrawerTabsEnum {
  details = '1',
  contacts = '2',
  comments = '3',
}

const TaskDrawer = ({
  taskId,
  onClose,
  showCompleteForm,
  specificTab = TaskDrawerTabsEnum.details,
  defaultValues,
  filter,
  rowsPerPage,
}: TaskDrawerProps): ReactElement => {
  const accountListId = useAccountListId();
  const classes = useStyles();
  const [open, setOpen] = useState(!taskId);
  const { t } = useTranslation();
  const [tab, setTab] = useState(specificTab);
  const { data, loading } = useGetTaskForTaskDrawerQuery({
    variables: {
      accountListId: accountListId ?? '',
      taskId: taskId ?? '',
    },
    skip: !taskId,
    onCompleted: () => setOpen(true),
  });

  const handleTabChange = (
    _: React.ChangeEvent<Record<string, unknown>>,
    tab: TaskDrawerTabsEnum,
  ): void => {
    setTab(tab);
  };

  const onDrawerClose = (): void => {
    setOpen(false);
    onClose && onClose();
  };

  const task = data?.task;

  const title = ((): string => {
    if (task) {
      if (task.activityType) {
        if (showCompleteForm) {
          return t('Complete {{activityType}}', {
            activityType: t(task.activityType),
          });
        } else {
          return t(task.activityType);
        }
      } else {
        if (showCompleteForm) {
          return t('Complete {{activityType}}', { activityType: t('Task') });
        } else {
          return t('Task');
        }
      }
    } else {
      return t('Add Task');
    }
  })();

  return (
    <Box>
      {loading && <Loading loading={true} />}
      <Drawer
        open={open}
        onClose={onDrawerClose}
        anchor="right"
        classes={{ paper: classes.paper }}
      >
        <TabContext value={tab}>
          <Box className={[classes.fixed, classes.paper].join(' ')}>
            <Container className={classes.container}>
              <Grid container alignItems="center">
                <Grid className={classes.title} item>
                  <Box mr={1}>
                    {task ? (
                      <TaskStatus
                        taskId={task.id}
                        startAt={task.startAt ?? undefined}
                        completedAt={task.completedAt ?? undefined}
                        disableTooltip
                      />
                    ) : (
                      <TaskStatus color="primary" disableTooltip />
                    )}
                  </Box>
                  <Typography variant="h6" data-testid="TaskDrawerTitle">
                    {title}
                  </Typography>
                </Grid>
                <Grid item>
                  <IconButton size="small" onClick={onDrawerClose}>
                    <CloseIcon titleAccess={t('Close')} />
                  </IconButton>
                </Grid>
              </Grid>
            </Container>
            <AppBar position="static">
              <TabList onChange={handleTabChange} variant="fullWidth">
                <Tab label={t('Details')} value="1" />
                <Tab
                  label={t('Contacts ({{ contactCount }})', {
                    contactCount: task?.contacts?.nodes?.length || 0,
                  })}
                  value="2"
                  disabled={!task}
                />
                <Tab label={t('Comments')} value="3" disabled={!task} />
              </TabList>
            </AppBar>
          </Box>
          <Box className={classes.content}>
            <AnimatePresence initial={false}>
              <TabPanel
                key="1"
                value={TaskDrawerTabsEnum.details}
                className={classes.tabPanel}
              >
                <motion.div
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                >
                  {!loading && accountListId && (
                    <>
                      {showCompleteForm ? (
                        task && (
                          <TaskDrawerCompleteForm
                            accountListId={accountListId}
                            task={task}
                            onClose={onDrawerClose}
                          />
                        )
                      ) : (
                        <TaskDrawerForm
                          accountListId={accountListId}
                          task={task} // TODO: Use fragments to ensure all required fields are loaded
                          onClose={onDrawerClose}
                          defaultValues={defaultValues}
                          filter={filter}
                          rowsPerPage={rowsPerPage || 100}
                        />
                      )}
                    </>
                  )}
                </motion.div>
              </TabPanel>
              {task && accountListId && (
                <>
                  <TabPanel
                    key="2"
                    value={TaskDrawerTabsEnum.contacts}
                    className={classes.tabPanel}
                  >
                    <motion.div
                      initial={{ x: 300, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -300, opacity: 0 }}
                    >
                      <TaskDrawerContactList
                        accountListId={accountListId}
                        contactIds={task.contacts.nodes.map(({ id }) => id)}
                      />
                    </motion.div>
                  </TabPanel>
                  <TabPanel
                    key="3"
                    value={TaskDrawerTabsEnum.comments}
                    className={classes.tabPanel}
                  >
                    <motion.div
                      initial={{ x: 300, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -300, opacity: 0 }}
                    >
                      <TaskDrawerCommentList
                        accountListId={accountListId}
                        taskId={task.id}
                      />
                    </motion.div>
                  </TabPanel>
                </>
              )}
            </AnimatePresence>
          </Box>
        </TabContext>
      </Drawer>
    </Box>
  );
};

export default TaskDrawer;
