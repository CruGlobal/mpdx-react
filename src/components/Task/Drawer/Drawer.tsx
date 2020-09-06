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
import TaskDrawerForm from './Form';
import TaskDrawerContactList from './ContactList';
import TaskDrawerCommentList from './CommentList';

const useStyles = makeStyles((theme: Theme) => ({
    container: {
        padding: theme.spacing(2, 2),
    },
    title: {
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
}

const TaskDrawer = ({ taskId, onClose }: TaskDrawerProps): ReactElement => {
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

    const onChange = (task: Task): void => {
        setTask(task);
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

    return (
        <Box>
            <Drawer open={open} onClose={onDrawerClose} anchor="right" classes={{ paper: classes.paper }}>
                <Container className={classes.container}>
                    <Grid container alignItems="center">
                        <Grid className={classes.title} item>
                            <Typography variant="h6" data-testid="TaskDrawerTitle">
                                {task ? (task.activityType ? t(task.activityType) : t('Task')) : t('Add Task')}
                            </Typography>
                        </Grid>
                        <Grid item>
                            <IconButton size="small" onClick={onDrawerClose} aria-label="Close">
                                <CloseIcon />
                            </IconButton>
                        </Grid>
                    </Grid>
                </Container>
                <TabContext value={tab}>
                    <AppBar position="static">
                        <TabList onChange={handleTabChange} variant="fullWidth">
                            <Tab label={t('Details')} value="1" />
                            <Tab label={t('Contacts')} value="2" disabled={!task} />
                            <Tab label={t('Comments')} value="3" disabled={!task} />
                        </TabList>
                    </AppBar>
                    <AnimatePresence initial={false}>
                        <TabPanel key="1" value="1" className={classes.tabPanel}>
                            <motion.div
                                initial={{ x: 300, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -300, opacity: 0 }}
                            >
                                {!loading && (
                                    <TaskDrawerForm
                                        accountListId={state.accountListId}
                                        task={task}
                                        onClose={onDrawerClose}
                                        onChange={onChange}
                                    />
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
                                        <TaskDrawerCommentList accountListId={state.accountListId} taskId={task.id} />
                                    </motion.div>
                                </TabPanel>
                            </>
                        )}
                    </AnimatePresence>
                </TabContext>
            </Drawer>
        </Box>
    );
};

export default TaskDrawer;
