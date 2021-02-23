import { MockedResponse } from '@apollo/client/testing';
import { DateTime } from 'luxon';
import { CreateTaskCommentMutation } from '../../../../../../types/CreateTaskCommentMutation';
import { CREATE_TASK_COMMENT_MUTATION } from './Form';

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
      query: CREATE_TASK_COMMENT_MUTATION,
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
