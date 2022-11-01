import { MockedResponse } from '@apollo/client/testing';
import { DateTime } from 'luxon';
import {
  ActivityTypeEnum,
  TaskCreateInput,
} from '../../../../../../../graphql/types.generated';
import {
  CreateTaskCommentDocument,
  CreateTaskCommentMutation,
} from '../../../../../Task/Modal/CommentList/Form/CreateTaskComment.generated';
import {
  CreateTaskDocument,
  CreateTaskMutation,
  TaskMutationResponseFragment,
} from '../../../../../Task/Modal/Form/TaskModal.generated';

export const createNewsletterTaskMutationMock = (): MockedResponse => {
  const task: TaskCreateInput = {
    activityType: ActivityTypeEnum.NewsletterPhysical,
    completedAt: null,
    contactIds: [],
    id: null,
    nextAction: null,
    notificationTimeBefore: null,
    notificationTimeUnit: null,
    notificationType: null,
    result: null,
    startAt: DateTime.local().plus({ hours: 1 }).startOf('hour').toISO(),
    subject: 'abc',
    tagList: [],
    userId: null,
  };
  const data: CreateTaskMutation = {
    createTask: {
      task: { ...task, id: 'task-1' } as TaskMutationResponseFragment,
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

export const createNewsLetterTaskCommentMutation = (): MockedResponse => {
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
