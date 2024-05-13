import { MockedResponse } from '@apollo/client/testing';
import { DateTime } from 'luxon';
import {
  ActivityTypeEnum,
  NotificationTimeUnitEnum,
  NotificationTypeEnum,
  TaskCreateInput,
  TaskUpdateInput,
} from 'src/graphql/types.generated';
import { TaskRowFragment } from '../../TaskRow/TaskRow.generated';
import { GetTaskForTaskModalQuery } from '../TaskModalTask.generated';
import {
  CreateTasksDocument,
  CreateTasksMutation,
  DeleteTaskDocument,
  DeleteTaskMutation,
  UpdateTaskDocument,
  UpdateTaskMutation,
} from './TaskModal.generated';

export const createTasksMutationMock = (): MockedResponse => {
  const task: TaskCreateInput = {
    activityType: null,
    subject: 'abc',
    startAt: DateTime.local().toISO(),
    completedAt: null,
    tagList: [],
    contactIds: [],
    userId: null,
    notificationTimeBefore: null,
    notificationType: null,
    notificationTimeUnit: null,
    result: null,
    nextAction: null,
    comment: 'test comment',
    location: '',
  };
  const data: CreateTasksMutation = {
    createTasks: {
      tasks: [{ ...task, id: 'task-1' } as TaskRowFragment],
    },
  };

  return {
    request: {
      query: CreateTasksDocument,
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
    activityType: ActivityTypeEnum.AppointmentInPerson,
    subject: 'On the Journey with the Johnson Family',
    startAt: DateTime.local(2013, 1, 5, 1, 2).toISO(),
    completedAt: DateTime.local(2016, 1, 5, 1, 2).toISO(),
    tagList: ['tag-1', 'tag-2'],
    contactIds: ['contact-1', 'contact-2'],
    userId: 'user-1',
  };
  const data: UpdateTaskMutation = {
    updateTask: {
      task: task as TaskRowFragment,
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
  const task: GetTaskForTaskModalQuery['task'] = {
    id: 'task-1',
    activityType: ActivityTypeEnum.PartnerCareEmail,
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
