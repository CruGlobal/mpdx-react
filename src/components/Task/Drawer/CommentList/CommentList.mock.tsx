import { MockedResponse } from '@apollo/client/testing';
import {
  GetCommentsForTaskDrawerCommentListDocument,
  GetCommentsForTaskDrawerCommentListQuery,
} from './TaskListComments.generated';

export const getCommentsForTaskDrawerCommentListMock = (
  accountListId: string,
  taskId: string,
): MockedResponse => {
  const data: GetCommentsForTaskDrawerCommentListQuery = {
    task: {
      id: taskId,
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
      query: GetCommentsForTaskDrawerCommentListDocument,
      variables: {
        accountListId,
        taskId,
      },
    },
    result: {
      data,
    },
  };
};

export const getCommentsForTaskDrawerCommentListEmptyMock = (
  accountListId: string,
  taskId: string,
): MockedResponse => {
  const data: GetCommentsForTaskDrawerCommentListQuery = {
    task: {
      id: taskId,
      comments: {
        nodes: [],
      },
    },
  };

  return {
    request: {
      query: GetCommentsForTaskDrawerCommentListDocument,
      variables: {
        accountListId,
        taskId,
      },
    },
    result: {
      data,
    },
  };
};

export const getCommentsForTaskDrawerCommentListLoadingMock = (
  accountListId: string,
  taskId: string,
): MockedResponse => {
  return {
    ...getCommentsForTaskDrawerCommentListMock(accountListId, taskId),
    delay: 100931731455,
  };
};

export const getCommentsForTaskDrawerCommentListErrorMock = (
  accountListId: string,
  taskId: string,
): MockedResponse => {
  return {
    request: {
      query: GetCommentsForTaskDrawerCommentListDocument,
      variables: {
        accountListId,
        taskId,
      },
    },
    error: { name: 'error', message: 'Error loading data.  Try again.' },
  };
};
