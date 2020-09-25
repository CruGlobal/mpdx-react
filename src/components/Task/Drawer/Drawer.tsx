import React, { ReactElement, useState, useEffect } from 'react';
import {
    makeStyles,
    Theme,
    IconButton,
    Box,
    Container,
    Grid,
    Drawer,
    AppBar,
    Tab,
    Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { useTranslation } from 'react-i18next';
import { TabContext, TabList, TabPanel } from '@material-ui/lab';
import { gql, useLazyQuery } from '@apollo/client';
import { AnimatePresence, motion } from 'framer-motion';
import {
    GetTaskForTaskDrawerQuery,
    GetTaskForTaskDrawerQuery_task as Task,
} from '../../../../types/GetTaskForTaskDrawerQuery';
import { useApp } from '../../App';
import Loading from '../../Loading';
import TaskStatus from '../Status';
import TaskDrawerForm from './Form';
import TaskDrawerContactList from './ContactList';
import TaskDrawerCommentList from './CommentList';
import TaskDrawerCompleteForm from './CompleteForm';

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

export const GET_TASK_FOR_TASK_DRAWER_QUERY = gql`
    query GetTaskForTaskDrawerQuery($accountListId: ID!, $taskId: ID!) {
        task(accountListId: $accountListId, id: $taskId) {
            id
            activityType
            subject
            startAt
            completedAt
            tagList
            contacts {
                nodes {
                    id
                    name
                }
            }
            user {
                id
                firstName
                lastName
            }
            notificationTimeBefore
            notificationType
            notificationTimeUnit
        }
    }
`;

export interface TaskDrawerProps {
    taskId?: string;
    onClose?: () => void;
    showCompleteForm?: boolean;
    defaultValues?: Partial<Task>;
}

const TaskDrawer = ({ taskId, onClose, showCompleteForm, defaultValues }: TaskDrawerProps): ReactElement => {
    const { state } = useApp();
    const classes = useStyles();
    const [open, setOpen] = useState(false);
    const { t } = useTranslation();
    const [tab, setTab] = useState('1');
    const [getTask, { data, loading }] = useLazyQuery<GetTaskForTaskDrawerQuery>(GET_TASK_FOR_TASK_DRAWER_QUERY);
    const [task, setTask] = useState<Task>(null);

    const onLoad = async (): Promise<void> => {
        if (taskId) {
            await getTask({ variables: { accountListId: state.accountListId, taskId } });
        } else {
            setOpen(true);
        }
    };

    const handleTabChange = (_, tab: string): void => {
        setTab(tab);
    };

    const onDrawerClose = (): void => {
        setOpen(false);
        onClose && onClose();
    };

    useEffect(() => {
        onLoad();
    }, []);

    if (data?.task && task !== data?.task) {
        setTask(data.task);
        setOpen(true);
    }

    useEffect(() => {
        onLoad();
    }, [taskId]);

    const title = ((): string => {
        if (task) {
            if (task.activityType) {
                if (showCompleteForm) {
                    return t('Complete {{activityType}}', { activityType: t(task.activityType) });
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
            <Drawer open={open} onClose={onDrawerClose} anchor="right" classes={{ paper: classes.paper }}>
                <TabContext value={tab}>
                    <Box className={[classes.fixed, classes.paper].join(' ')}>
                        <Container className={classes.container}>
                            <Grid container alignItems="center">
                                <Grid className={classes.title} item>
                                    <Box mr={1}>
                                        {task ? (
                                            <TaskStatus
                                                taskId={task.id}
                                                startAt={task.startAt}
                                                completedAt={task.completedAt}
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
                                    <IconButton size="small" onClick={onDrawerClose} aria-label="Close">
                                        <CloseIcon />
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
                            <TabPanel key="1" value="1" className={classes.tabPanel}>
                                <motion.div
                                    initial={{ x: 300, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -300, opacity: 0 }}
                                >
                                    {!loading && (
                                        <>
                                            {showCompleteForm ? (
                                                <TaskDrawerCompleteForm
                                                    accountListId={state.accountListId}
                                                    task={task}
                                                    onClose={onDrawerClose}
                                                />
                                            ) : (
                                                <TaskDrawerForm
                                                    accountListId={state.accountListId}
                                                    task={task}
                                                    onClose={onDrawerClose}
                                                    defaultValues={defaultValues}
                                                />
                                            )}
                                        </>
                                    )}
                                </motion.div>
                            </TabPanel>
                            {task && (
                                <>
                                    <TabPanel key="2" value="2" className={classes.tabPanel}>
                                        <motion.div
                                            initial={{ x: 300, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            exit={{ x: -300, opacity: 0 }}
                                        >
                                            <TaskDrawerContactList
                                                accountListId={state.accountListId}
                                                contactIds={task.contacts.nodes.map(({ id }) => id)}
                                            />
                                        </motion.div>
                                    </TabPanel>
                                    <TabPanel key="3" value="3" className={classes.tabPanel}>
                                        <motion.div
                                            initial={{ x: 300, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            exit={{ x: -300, opacity: 0 }}
                                        >
                                            <TaskDrawerCommentList
                                                accountListId={state.accountListId}
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
