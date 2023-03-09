import { MockedResponse } from '@apollo/client/testing';
import { DateTime } from 'luxon';
import {
  ActivityTypeEnum,
  TaskCreateInput,
} from '../../../../../../../graphql/types.generated';
import {
  CreateTaskCommentDocument,
  CreateTaskCommentMutation,
} from '../../../../../Task/Modal/Comments/Form/CreateTaskComment.generated';
import {
  CreateTaskDocument,
  CreateTaskMutation,
  TaskMutationResponseFragment,
} from '../../../../../Task/Modal/Form/TaskModal.generated';

export const createNewsletterTaskMutationMock = (
  id: string,
  activityType: ActivityTypeEnum,
): MockedResponse => {
  const task: TaskCreateInput = {
    activityType,
    completedAt: null,
    startAt: DateTime.local().plus({ hours: 1 }).startOf('hour').toISO(),
    subject: 'abc',
  };
  const data: CreateTaskMutation = {
    createTask: {
      task: { ...task, id } as TaskMutationResponseFragment,
    },
  };

  return {
    request: {
      query: CreateTaskDocument,
      variables: {
        accountListId: 'abc',
        attributes: task,
      },
    },
    result: { data },
  };
};

export const createNewsLetterTaskCommentMutation = (
  taskId: string,
): MockedResponse => {
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
        taskId,
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
