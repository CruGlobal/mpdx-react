import React, { ReactElement } from 'react';
import {
  Box,
  Typography,
  makeStyles,
  Theme,
  CardHeader,
  CardActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  CardContent,
} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { DateTime } from 'luxon';
import AnimatedCard from '../../../AnimatedCard';
import TaskStatus from '../../../Task/Status';
import illustration8 from '../../../../images/drawkit/grape/drawkit-grape-pack-illustration-8.svg';
import { GetThisWeekQuery } from '../GetThisWeek.generated';
import useTaskModal from 'src/hooks/useTaskModal';

const useStyles = makeStyles((theme: Theme) => ({
  div: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
  },
  list: {
    flex: 1,
    padding: 0,
    overflow: 'auto',
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
  const classes = useStyles();
  const { t } = useTranslation();
  const { openTaskModal } = useTaskModal();

  const handleClick = ({
    id: taskId,
  }: GetThisWeekQuery['dueTasks']['nodes'][0]): void => {
    openTaskModal({ taskId });
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
                  <Skeleton variant="rect" width={20} height={20} />
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
          <CardActions>
            <Button size="small" color="primary" disabled>
              {t('View All ({{ totalCount, number }})', { totalCount: 0 })}
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
                  >
                    <ListItemText
                      disableTypography={true}
                      primary={
                        <Typography variant="body1">
                          {`${task.contacts.nodes[0].name}${
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
                            >
                              {
                                t(
                                  task.activityType ?? '',
                                ) /* manually added to translation file */
                              }
                            </Typography>{' '}
                            <Typography
                              component="span"
                              variant="body2"
                              color="textSecondary"
                            >
                              {task.activityType && '—'} {task.subject}
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
                <Link
                  href={`/accountLists/${accountListId}/tasks?completed=false&startAt[max]=${DateTime.local().toISODate()}`}
                  passHref
                >
                  <Button
                    size="small"
                    color="primary"
                    data-testid="TasksDueThisWeekButtonViewAll"
                  >
                    {t('View All ({{ totalCount, number }})', {
                      totalCount: dueTasks.totalCount,
                    })}
                  </Button>
                </Link>
              </CardActions>
            </>
          )}
        </motion.div>
      )}
    </AnimatedCard>
  );
};

export default TasksDueThisWeek;
