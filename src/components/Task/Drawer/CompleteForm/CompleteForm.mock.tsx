import { MockedResponse } from '@apollo/client/testing';
import { DateTime } from 'luxon';
import {
  ActivityTypeEnum,
  NotificationTimeUnitEnum,
  NotificationTypeEnum,
  ResultEnum,
  TaskUpdateInput,
} from '../../../../../graphql/types.generated';
import {
  GetTaskForTaskDrawerDocument,
  GetTaskForTaskDrawerQuery,
} from '../TaskDrawerTask.generated';
import {
  CompleteTaskDocument,
  CompleteTaskMutation,
} from './CompleteTask.generated';

export const getCompleteTaskForTaskDrawerMock = (
  accountListId: string,
  taskId: string,
): MockedResponse => {
  const data: GetTaskForTaskDrawerQuery = {
    task: {
      id: taskId,
      activityType: ActivityTypeEnum.NewsletterEmail,
      subject: 'On the Journey with the Johnson Family',
      startAt: DateTime.local(2012, 1, 5, 1, 2).toISO(),
      completedAt: DateTime.local(2015, 1, 5, 1, 2).toISO(),
      tagList: ['tag-1', 'tag-2'],
      contacts: {
        nodes: [
          { id: 'contact-1', name: 'Anderson, Robert' },
          { id: 'contact-2', name: 'Smith, John' },
        ],
      },
      user: { id: 'user-1', firstName: 'Anderson', lastName: 'Robert' },
      notificationTimeBefore: 20,
      notificationType: NotificationTypeEnum.Both,
      notificationTimeUnit: NotificationTimeUnitEnum.Hours,
    },
  };
  return {
    request: {
      query: GetTaskForTaskDrawerDocument,
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
export const completeSimpleTaskMutationMock = (
  accountListId: string,
  taskId: string,
): MockedResponse => {
  const task: NonNullable<CompleteTaskMutation['updateTask']>['task'] = {
    id: taskId,
    completedAt: DateTime.local(2015, 1, 5, 1, 2).toISO(),
    tagList: ['tag-1', 'tag-2'],
    result: ResultEnum.None,
    nextAction: null,
  };
  const attributes: TaskUpdateInput = {
    id: 'task-1',
    completedAt: DateTime.local(2015, 1, 5, 1, 2).toISO(),
    tagList: ['tag-1', 'tag-2'],
    result: ResultEnum.None,
  };
  const data: CompleteTaskMutation = {
    updateTask: {
      task,
    },
  };
  return {
    request: {
      query: CompleteTaskDocument,
      variables: {
        accountListId,
        attributes,
      },
    },
    result: { data },
  };
};
export const completeTaskMutationMock = (
  accountListId: string,
  taskId: string,
): MockedResponse => {
  const task: NonNullable<CompleteTaskMutation['updateTask']>['task'] = {
    id: taskId,
    completedAt: DateTime.local(2015, 1, 5, 1, 2).toISO(),
    tagList: ['tag-1', 'tag-2'],
    result: ResultEnum.Completed,
    nextAction: ActivityTypeEnum.Appointment,
  };
  const attributes: TaskUpdateInput = {
    id: taskId,
    completedAt: DateTime.local(2015, 1, 5, 1, 2).toISO(),
    tagList: ['tag-1', 'tag-2'],
    result: ResultEnum.Completed,
    nextAction: ActivityTypeEnum.Appointment,
  };
  const data: CompleteTaskMutation = {
    updateTask: {
      task,
    },
  };
  return {
    request: {
      query: CompleteTaskDocument,
      variables: {
        accountListId,
        attributes,
      },
    },
    result: { data },
  };
};

export default completeTaskMutationMock;
