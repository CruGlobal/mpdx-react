import { MockedResponse } from '@apollo/client/testing';
import { DateTime } from 'luxon';
import {
  CreateTaskCommentDocument,
  CreateTaskCommentMutation,
} from './CreateTaskComment.generated';

export const createTaskCommentMutationMock = (): MockedResponse => {
  const data: CreateTaskCommentMutation = {
    createTaskComment: {
      comment: {
        id: 'comment-0',
        body: 'comment',
        createdAt: DateTime.local().toISO(),
        me: true,
        person: {
          id: 'user-1',
          firstName: 'John',
          lastName: 'Smith',
        },
      },
    },
  };

  return {
    request: {
      query: CreateTaskCommentDocument,
      variables: {
        accountListId: 'abc',
        taskId: 'task-1',
        attributes: {
          id: 'comment-0',
          body: 'comment',
        },
      },
    },
    result: {
      data,
    },
  };
};

export default createTaskCommentMutationMock;
