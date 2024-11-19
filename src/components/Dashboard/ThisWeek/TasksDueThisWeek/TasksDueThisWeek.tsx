import NextLink from 'next/link';
import React, { ReactElement } from 'react';
import {
  Box,
  Button,
  CardActions,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Skeleton,
  Theme,
  Typography,
} from '@mui/material';
import { motion } from 'framer-motion';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import AnimatedCard from 'src/components/AnimatedCard';
import { TaskModalEnum } from 'src/components/Task/Modal/TaskModal';
import TaskStatus from 'src/components/Task/Status';
import { useLocale } from 'src/hooks/useLocale';
import { usePhaseData } from 'src/hooks/usePhaseData';
import useTaskModal from 'src/hooks/useTaskModal';
import illustration8 from 'src/images/drawkit/grape/drawkit-grape-pack-illustration-8.svg';
import { numberFormat } from 'src/lib/intlFormat';
import { GetThisWeekQuery } from '../GetThisWeek.generated';

const useStyles = makeStyles()((theme: Theme) => ({
  div: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
  },
  list: {
    flex: 1,
    padding: 0,
    overflow: 'hidden',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    height: '322px',
    [theme.breakpoints.down('xs')]: {
      height: 'auto',
    },
  },
  cardContent: {
    padding: theme.spacing(2),
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  img: {
    height: '150px',
    marginBottom: theme.spacing(2),
  },
}));

interface Props {
  accountListId: string;
  loading?: boolean;
  dueTasks?: GetThisWeekQuery['dueTasks'];
}

const TasksDueThisWeek = ({
  loading,
  dueTasks,
  accountListId,
}: Props): ReactElement => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const locale = useLocale();
  const { openTaskModal, preloadTaskModal } = useTaskModal();

  const { activityTypes } = usePhaseData();

  const handleClick = ({
    id: taskId,
  }: GetThisWeekQuery['dueTasks']['nodes'][0]): void => {
    openTaskModal({ taskId, view: TaskModalEnum.Edit });
  };

  return (
    <AnimatedCard className={classes.card}>
      <CardHeader title={t('Tasks Due This Week')} />
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={classes.div}
        >
          <List
            className={classes.list}
            data-testid="TasksDueThisWeekListLoading"
          >
            {[0, 1, 2].map((index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={<Skeleton variant="text" width={100} />}
                  secondary={<Skeleton variant="text" width={200} />}
                />
                <ListItemSecondaryAction>
                  <Skeleton variant="rectangular" width={20} height={20} />
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
          <CardActions>
            <Button size="small" color="primary" disabled>
              {t('View All ({{totalCount}})', { totalCount: 0 })}
            </Button>
          </CardActions>
        </motion.div>
      )}
      {!loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={classes.div}
        >
          {!dueTasks || dueTasks.nodes.length === 0 ? (
            <CardContent
              className={classes.cardContent}
              data-testid="TasksDueThisWeekCardContentEmpty"
            >
              <img src={illustration8} className={classes.img} alt="empty" />
              {t('No tasks to show.')}
            </CardContent>
          ) : (
            <>
              <List className={classes.list} data-testid="TasksDueThisWeekList">
                {dueTasks.nodes.map((task) => (
                  <ListItem
                    key={task.id}
                    button
                    data-testid={`TasksDueThisWeekListItem-${task.id}`}
                    onClick={(): void => handleClick(task)}
                    onMouseEnter={() => preloadTaskModal(TaskModalEnum.Edit)}
                  >
                    <ListItemText
                      disableTypography={true}
                      primary={
                        <Typography variant="body1">
                          {task.contacts.nodes.length > 0 &&
                            `${task.contacts.nodes[0].name}${
                              task.contacts.totalCount > 1
                                ? `, +${task.contacts.totalCount - 1} more`
                                : ''
                            }`}
                        </Typography>
                      }
                      secondary={
                        <Box style={{ whiteSpace: 'nowrap' }}>
                          <Box
                            component="div"
                            textOverflow="ellipsis"
                            overflow="hidden"
                          >
                            <Typography
                              component="span"
                              variant="body2"
                              color="textPrimary"
                              marginRight="5px"
                            >
                              {!!task.activityType &&
                                activityTypes.get(task.activityType)
                                  ?.translatedFullName}
                            </Typography>
                            <Typography
                              component="span"
                              variant="body2"
                              color="textSecondary"
                            >
                              {task.subject}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <TaskStatus
                        taskId={task.id}
                        startAt={task.startAt ?? undefined}
                        completedAt={task.completedAt ?? undefined}
                        tooltipPlacement="left"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
              <CardActions>
                <Button
                  LinkComponent={NextLink}
                  href={`/accountLists/${accountListId}/tasks?completed=false&startAt[max]=${DateTime.local().toISODate()}`}
                  size="small"
                  color="primary"
                  data-testid="TasksDueThisWeekButtonViewAll"
                >
                  {t('View All ({{totalCount}})', {
                    totalCount: numberFormat(dueTasks.totalCount, locale),
                  })}
                </Button>
              </CardActions>
            </>
          )}
        </motion.div>
      )}
    </AnimatedCard>
  );
};

export default TasksDueThisWeek;
