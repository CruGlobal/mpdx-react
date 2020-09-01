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
import { GetTaskForTaskDrawerQuery } from '../../../../types/GetTaskForTaskDrawerQuery';
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

interface Props {
    accountListId: string;
    taskId?: string;
}

const TaskDrawer = ({ accountListId, taskId }: Props): ReactElement => {
    const classes = useStyles();
    const [open, setOpen] = useState(false);
    const { t } = useTranslation();
    const [tab, setTab] = useState('1');
    const [getTask, { data, loading }] = useLazyQuery<GetTaskForTaskDrawerQuery>(GET_TASK_FOR_TASK_DRAWER_QUERY);

    useEffect(() => {
        setOpen(true);
        if (taskId) {
            getTask({ variables: { accountListId, taskId } });
        }
    }, []);

    const handleTabChange = (_, tab: string): void => {
        setTab(tab);
    };

    return (
        <Box>
            <Drawer open={open} onClose={(): void => setOpen(false)} anchor="right" classes={{ paper: classes.paper }}>
                <Container className={classes.container}>
                    <Grid container alignItems="center">
                        <Grid className={classes.title} item>
                            <Typography variant="h6">{taskId ? t('Task') : t('Add Task')}</Typography>
                        </Grid>
                        <Grid item>
                            <IconButton size="small" onClick={(): void => setOpen(false)}>
                                <CloseIcon />
                            </IconButton>
                        </Grid>
                    </Grid>
                </Container>
                <TabContext value={tab}>
                    <AppBar position="static">
                        <TabList onChange={handleTabChange} variant="fullWidth">
                            <Tab label={t('Details')} value="1" />
                            <Tab label={t('Contacts')} value="2" disabled={!taskId && true} />
                            <Tab label={t('Comments')} value="3" disabled={!taskId && true} />
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
                                        accountListId={accountListId}
                                        task={data?.task}
                                        onClose={(): void => setOpen(false)}
                                    />
                                )}
                            </motion.div>
                        </TabPanel>
                        {taskId && (
                            <>
                                <TabPanel key="2" value="2" className={classes.tabPanel}>
                                    <motion.div
                                        initial={{ x: 300, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: -300, opacity: 0 }}
                                    >
                                        {data?.task && (
                                            <TaskDrawerContactList
                                                accountListId={accountListId}
                                                contactIds={data.task.contacts.nodes.map(({ id }) => id)}
                                            />
                                        )}
                                    </motion.div>
                                </TabPanel>
                                <TabPanel key="3" value="3" className={classes.tabPanel}>
                                    <motion.div
                                        initial={{ x: 300, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: -300, opacity: 0 }}
                                    >
                                        <TaskDrawerCommentList accountListId={accountListId} taskId={taskId} />
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
