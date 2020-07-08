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
    Checkbox,
    CardContent,
} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { motion } from 'framer-motion';
import AnimatedCard from '../../../AnimatedCard';
import { GetThisWeekQuery_dueTasks } from '../../../../../types/GetThisWeekQuery';

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
    loading: boolean;
    dueTasks?: GetThisWeekQuery_dueTasks;
}

const TasksDueThisWeek = ({ loading, dueTasks }: Props): ReactElement => {
    const classes = useStyles();

    return (
        <AnimatedCard className={classes.card}>
            <CardHeader title="Tasks Due This Week" />
            {loading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={classes.div}
                >
                    <List className={classes.list}>
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
                            View All (0)
                        </Button>
                    </CardActions>
                </motion.div>
            )}
            {!loading && dueTasks?.nodes && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={classes.div}
                >
                    {dueTasks.nodes.length === 0 && (
                        <CardContent className={classes.cardContent}>
                            <img src="/drawkit/grape/drawkit-grape-pack-illustration-8.svg" className={classes.img} />
                            No tasks to show.
                        </CardContent>
                    )}
                    {dueTasks.nodes.length > 0 && (
                        <>
                            <List className={classes.list}>
                                {dueTasks.nodes.map((task) => (
                                    <ListItem key={task.id} button>
                                        <ListItemText
                                            disableTypography={true}
                                            primary={
                                                <Typography variant="body1">
                                                    {task.contacts.nodes.map(({ name }) => name).join(', ')}
                                                </Typography>
                                            }
                                            secondary={
                                                <Box style={{ whiteSpace: 'nowrap' }}>
                                                    <Box component="div" textOverflow="ellipsis" overflow="hidden">
                                                        <Typography
                                                            component="span"
                                                            variant="body2"
                                                            color="textPrimary"
                                                        >
                                                            {task.activityType}
                                                        </Typography>{' '}
                                                        <Typography
                                                            component="span"
                                                            variant="body2"
                                                            color="textSecondary"
                                                        >
                                                            — {task.subject}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            }
                                        />
                                        <ListItemSecondaryAction>
                                            <Checkbox edge="end" />
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))}
                            </List>
                            <CardActions>
                                <Button size="small" color="primary">
                                    View All ({dueTasks?.totalCount || 0})
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
