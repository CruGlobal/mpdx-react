import { MockedResponse } from '@apollo/client/testing';
import { DateTime } from 'luxon';
import {
  ActivityTypeEnum,
  NotificationTimeUnitEnum,
  NotificationTypeEnum,
  TaskCreateInput,
  TaskUpdateInput,
} from '../../../../../graphql/types.generated';
import { GetTaskForTaskDrawerQuery } from '../TaskDrawerTask.generated';
import {
  CreateTaskDocument,
  CreateTaskMutation,
  DeleteTaskDocument,
  DeleteTaskMutation,
  GetDataForTaskDrawerDocument,
  GetDataForTaskDrawerQuery,
  TaskMutationResponseFragment,
  UpdateTaskDocument,
  UpdateTaskMutation,
} from './TaskDrawer.generated';

export const getDataForTaskDrawerMock = (
  accountListId: string,
): MockedResponse => {
  const data: GetDataForTaskDrawerQuery = {
    accountList: {
      id: accountListId,
      taskTagList: ['tag-1', 'tag-2', 'tag-3'],
    },
    accountListUsers: {
      nodes: [
        {
          id: 'def',
          user: { id: 'user-1', firstName: 'Robert', lastName: 'Anderson' },
        },
        {
          id: 'ghi',
          user: { id: 'user-2', firstName: 'John', lastName: 'Smith' },
        },
      ],
    },
    contacts: {
      nodes: [
        { id: 'contact-1', name: 'Anderson, Robert' },
        { id: 'contact-2', name: 'Smith, John' },
      ],
    },
  };

  return {
    request: {
      query: GetDataForTaskDrawerDocument,
      variables: {
        accountListId,
      },
    },
    result: {
      data,
    },
  };
};

export const getDataForTaskDrawerLoadingMock = (
  accountListId: string,
): MockedResponse => {
  return {
    ...getDataForTaskDrawerMock(accountListId),
    delay: 100931731455,
  };
};

export const getDataForTaskDrawerEmptyMock = (
  accountListId: string,
): MockedResponse => {
  const data: GetDataForTaskDrawerQuery = {
    accountList: {
      id: accountListId,
      taskTagList: ['tag-1', 'tag-2', 'tag-3'],
    },
    accountListUsers: {
      nodes: [],
    },
    contacts: {
      nodes: [],
    },
  };

  return {
    request: {
      query: GetDataForTaskDrawerDocument,
      variables: {
        accountListId,
      },
    },
    result: {
      data,
    },
  };
};

export const createTaskMutationMock = (): MockedResponse => {
  const task: TaskCreateInput = {
    id: null,
    activityType: null,
    subject: 'abc',
    startAt: DateTime.local().plus({ hours: 1 }).startOf('hour').toISO(),
    completedAt: null,
    tagList: [],
    contactIds: [],
    userId: null,
    notificationTimeBefore: null,
    notificationType: null,
    notificationTimeUnit: null,
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

export const updateTaskMutationMock = (): MockedResponse => {
  const task: TaskUpdateInput = {
    id: 'task-1',
    activityType: ActivityTypeEnum.NewsletterEmail,
    subject: 'On the Journey with the Johnson Family',
    startAt: DateTime.local(2013, 1, 5, 1, 2).toISO(),
    completedAt: DateTime.local(2016, 1, 5, 1, 2).toISO(),
    tagList: ['tag-1', 'tag-2'],
    contactIds: ['contact-1', 'contact-2'],
    userId: 'user-1',
    notificationTimeBefore: 20,
    notificationType: NotificationTypeEnum.Both,
    notificationTimeUnit: NotificationTimeUnitEnum.Hours,
  };
  const data: UpdateTaskMutation = {
    updateTask: {
      task: task as TaskMutationResponseFragment,
    },
  };
  return {
    request: {
      query: UpdateTaskDocument,
      variables: {
        accountListId: 'abc',
        attributes: task,
      },
    },
    result: { data },
  };
};

export const deleteTaskMutationMock = (): MockedResponse => {
  const task: GetTaskForTaskDrawerQuery['task'] = {
    id: 'task-1',
    activityType: ActivityTypeEnum.NewsletterEmail,
    subject: 'On the Journey with the Johnson Family',
    startAt: DateTime.local(2013, 1, 5, 1, 2).toISO(),
    completedAt: DateTime.local(2016, 1, 5, 1, 2).toISO(),
    tagList: ['tag-1', 'tag-2'],
    contacts: {
      nodes: [
        { id: 'contact-1', name: 'Anderson, Robert' },
        { id: 'contact-2', name: 'Smith, John' },
      ],
    },
    user: { id: 'user-1', firstName: 'Robert', lastName: 'Anderson' },
    notificationTimeBefore: 20,
    notificationType: NotificationTypeEnum.Both,
    notificationTimeUnit: NotificationTimeUnitEnum.Hours,
  };

  const data: DeleteTaskMutation = {
    deleteTask: {
      id: task.id,
    },
  };

  return {
    request: {
      query: DeleteTaskDocument,
      variables: {
        accountListId: 'abc',
        id: task.id,
      },
    },
    result: { data },
  };
};
