import React, { ReactElement } from 'react';
import { makeStyles, Theme, Box, Card, CardContent } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { gql, useQuery } from '@apollo/client';
import { sortBy } from 'lodash/fp';
import { GetCommentsForTaskDrawerCommentListQuery } from '../../../../../types/GetCommentsForTaskDrawerCommentListQuery';
import TaskDrawerCommentListItem from './Item';

const useStyles = makeStyles((theme: Theme) => ({
    cardContent: {
        padding: theme.spacing(2),
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    img: {
        height: '120px',
        marginBottom: 0,
        [theme.breakpoints.down('xs')]: {
            height: '150px',
            marginBottom: theme.spacing(2),
        },
    },
}));

export const GET_COMMENTS_FOR_TASK_DRAWER_CONTACT_LIST_QUERY = gql`
    query GetCommentsForTaskDrawerCommentListQuery($accountListId: ID!, $taskId: ID!) {
        task(accountListId: $accountListId, id: $taskId) {
            comments {
                nodes {
                    id
                    body
                    createdAt
                    me
                    person {
                        id
                        firstName
                        lastName
                    }
                }
            }
        }
    }
`;

interface Props {
    accountListId: string;
    taskId: string;
}

const TaskDrawerCommentList = ({ accountListId, taskId }: Props): ReactElement => {
    const classes = useStyles();
    const { t } = useTranslation();

    const { data, loading } = useQuery<GetCommentsForTaskDrawerCommentListQuery>(
        GET_COMMENTS_FOR_TASK_DRAWER_CONTACT_LIST_QUERY,
        {
            variables: {
                accountListId,
                taskId,
            },
        },
    );

    return (
        <Box m={2}>
            {loading ? (
                <Box data-testid="TaskDrawerCommentListLoading">
                    <TaskDrawerCommentListItem />
                    <TaskDrawerCommentListItem reverse />
                    <TaskDrawerCommentListItem />
                    <TaskDrawerCommentListItem reverse />
                </Box>
            ) : (
                <>
                    {data.task.comments.nodes.length === 0 && (
                        <Card data-testid="TaskDrawerCommentListEmpty">
                            <CardContent className={classes.cardContent}>
                                <img
                                    src={require('../../../../images/drawkit/grape/drawkit-grape-pack-illustration-4.svg')}
                                    className={classes.img}
                                    alt="empty"
                                />
                                {t('No Comments to show.')}
                            </CardContent>
                        </Card>
                    )}
                    {data.task.comments.nodes.length > 0 &&
                        sortBy('createdAt', data.task.comments.nodes).map((comment) => (
                            <Box data-testid={`TaskDrawerCommentListItem-${comment.id}`} key={comment.id}>
                                <TaskDrawerCommentListItem comment={comment} reverse={comment.me} />
                            </Box>
                        ))}
                </>
            )}
        </Box>
    );
};

export default TaskDrawerCommentList;
