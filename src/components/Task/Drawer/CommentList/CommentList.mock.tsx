import { MockedResponse } from '@apollo/client/testing';
import { GetCommentsForTaskDrawerCommentListQuery } from '../../../../../types/GetCommentsForTaskDrawerCommentListQuery';
import { GET_COMMENTS_FOR_TASK_DRAWER_CONTACT_LIST_QUERY } from './CommentList';

export const getCommentsForTaskDrawerCommentListMock = (): MockedResponse => {
  const data: GetCommentsForTaskDrawerCommentListQuery = {
    task: {
      id: 'task-1',
      comments: {
        nodes: [
          {
            id: 'comment-1',
            body: 'Hello',
            createdAt: '2019-10-09T05:55:20',
            person: {
              id: 'person-b',
              firstName: 'Sarah',
              lastName: 'Jones',
            },
            me: true,
          },
          {
            id: 'comment-2',
            body: 'How are you doing today?',
            createdAt: '2019-10-09T05:56:20',
            person: {
              id: 'person-b',
              firstName: 'Sarah',
              lastName: 'Jones',
            },
            me: true,
          },
          {
            id: 'comment-3',
            body: 'Doing well thank you!',
            createdAt: '2020-01-11T05:55:20',
            person: {
              id: 'person-a',
              firstName: 'Bob',
              lastName: 'Jones',
            },
            me: false,
          },
          {
            id: 'comment-4',
            body: 'How about you?',
            createdAt: '2020-01-11T05:56:20',
            person: {
              id: 'person-a',
              firstName: 'Bob',
              lastName: 'Jones',
            },
            me: false,
          },
          {
            id: 'comment-5',
            body: 'Nice weather we are having?',
            createdAt: '2020-01-12T05:55:20',
            person: {
              id: 'person-b',
              firstName: 'Sarah',
              lastName: 'Jones',
            },
            me: true,
          },
          {
            id: 'comment-6',
            body: 'Fine.',
            createdAt: '2020-01-12T05:56:20',
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
      id: 'task-1',
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
