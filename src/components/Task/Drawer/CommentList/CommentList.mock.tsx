import { MockedResponse } from '@apollo/client/testing';
import { GetCommentsForTaskDrawerCommentListQuery } from '../../../../../types/GetCommentsForTaskDrawerCommentListQuery';
import { GET_COMMENTS_FOR_TASK_DRAWER_CONTACT_LIST_QUERY } from './CommentList';

export const getCommentsForTaskDrawerCommentListMock = (): MockedResponse => {
    const data: GetCommentsForTaskDrawerCommentListQuery = {
        task: {
            comments: {
                nodes: [
                    {
                        id: 'comment-3',
                        body: 'Fine. Nice weather we are having?',
                        createdAt: '2020-01-13',
                        person: {
                            id: 'person-b',
                            firstName: 'Sarah',
                            lastName: 'Jones',
                        },
                        me: true,
                    },
                    {
                        id: 'comment-2',
                        body: 'Doing well thank you! How about you?',
                        createdAt: '2020-01-12',
                        person: {
                            id: 'person-a',
                            firstName: 'Bob',
                            lastName: 'Jones',
                        },
                        me: false,
                    },
                    {
                        id: 'comment-1',
                        body: 'How are you doing today?',
                        createdAt: '2019-10-12',
                        person: {
                            id: 'person-b',
                            firstName: 'Sarah',
                            lastName: 'Jones',
                        },
                        me: true,
                    },
                ],
            },
        },
    };

    return {
        request: {
            query: GET_COMMENTS_FOR_TASK_DRAWER_CONTACT_LIST_QUERY,
            variables: {
                accountListId: 'abc',
                taskId: 'task-1',
            },
        },
        result: {
            data,
        },
    };
};

export const getCommentsForTaskDrawerCommentListEmptyMock = (): MockedResponse => {
    const data: GetCommentsForTaskDrawerCommentListQuery = {
        task: {
            comments: {
                nodes: [],
            },
        },
    };

    return {
        request: {
            query: GET_COMMENTS_FOR_TASK_DRAWER_CONTACT_LIST_QUERY,
            variables: {
                accountListId: 'abc',
                taskId: 'task-1',
            },
        },
        result: {
            data,
        },
    };
};

export const getCommentsForTaskDrawerCommentListLoadingMock = (): MockedResponse => {
    return {
        ...getCommentsForTaskDrawerCommentListMock(),
        delay: 100931731455,
    };
};
