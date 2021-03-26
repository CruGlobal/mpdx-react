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
  UpdateTaskDocument,
  UpdateTaskMutation,
} from './TaskDrawer.generated';

export const getDataForTaskDrawerMock = (): MockedResponse => {
  const data: GetDataForTaskDrawerQuery = {
    accountList: {
      id: 'abc',
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
        accountListId: 'abc',
      },
    },
    result: {
      data,
    },
  };
};

export const createTaskMutationMock = (): MockedResponse => {
  const task: GetTaskForTaskDrawerQuery['task'] = {
    id: null,
    activityType: null,
    subject: 'abc',
    startAt: DateTime.local().plus({ hours: 1 }).startOf('hour').toISO(),
    completedAt: null,
    tagList: [],
    contacts: {
      nodes: [],
    },
    user: null,
    notificationTimeBefore: null,
    notificationType: null,
    notificationTimeUnit: null,
  };
  const data: CreateTaskMutation = {
    createTask: {
      task: { ...task, id: 'task-1' },
    },
  };
  const { contacts: _contacts, user: _user, id: _id, ...createTask } = task;
  const attributes: TaskCreateInput = {
    ...createTask,
    userId: null,
    contactIds: [],
  };

  return {
    request: {
      query: CreateTaskDocument,
      variables: {
        accountListId: 'abc',
        attributes,
      },
    },
    result: { data },
  };
};

export const updateTaskMutationMock = (): MockedResponse => {
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
  const data: UpdateTaskMutation = {
    updateTask: {
      task,
    },
  };
  const { contacts: _contacts, user: _user, ...updateTask } = task;
  const attributes: TaskUpdateInput = {
    ...updateTask,
    userId: task.user.id,
    contactIds: task.contacts.nodes.map(({ id }) => id),
  };
  return {
    request: {
      query: UpdateTaskDocument,
      variables: {
        accountListId: 'abc',
        attributes,
      },
    },
    result: { data },
  };
};

<<<<<<< HEAD
export const getDataForTaskDrawerLoadingMock = (): MockedResponse => {
  return {
    ...getDataForTaskDrawerMock(),
    delay: 100931731455,
=======
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
>>>>>>> origin/main
  };
};
