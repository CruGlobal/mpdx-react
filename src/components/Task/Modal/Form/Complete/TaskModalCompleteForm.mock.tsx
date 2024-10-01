import { MockedResponse } from '@apollo/client/testing';
import { DateTime } from 'luxon';
import {
  ActivityTypeEnum,
  NotificationTimeUnitEnum,
  NotificationTypeEnum,
  ResultEnum,
  TaskUpdateInput,
} from 'src/graphql/types.generated';
import {
  CreateTaskCommentDocument,
  CreateTaskCommentMutation,
} from '../../Comments/Form/CreateTaskComment.generated';
import {
  GetTaskForTaskModalDocument,
  GetTaskForTaskModalQuery,
} from '../../TaskModalTask.generated';
import {
  CompleteTaskDocument,
  CompleteTaskMutation,
} from './CompleteTask.generated';

export const getCompleteTaskForTaskModalMock = (
  accountListId: string,
  taskId: string,
): MockedResponse => {
  const data: GetTaskForTaskModalQuery = {
    task: {
      id: taskId,
      activityType: ActivityTypeEnum.PartnerCareDigitalNewsletter,
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
      query: GetTaskForTaskModalDocument,
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
    result: ResultEnum.Completed,
    nextAction: null,
  };
  const attributes: TaskUpdateInput = {
    id: 'task-1',
    completedAt: DateTime.local(2015, 1, 5, 1, 2).toISO(),
    tagList: ['tag-1', 'tag-2'],
    displayResult: null,
    result: ResultEnum.Completed,
    nextAction: null,
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
    nextAction: null,
  };
  const attributes: TaskUpdateInput = {
    id: taskId,
    completedAt: DateTime.local(2015, 1, 5, 1, 2).toISO(),
    tagList: ['tag-1', 'tag-2'],
    displayResult: null,
    result: ResultEnum.Completed,
    nextAction: null,
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
export const createTaskCommentMutation = (
  accountListId: string,
  taskId: string,
): MockedResponse => {
  const data: CreateTaskCommentMutation = {
    createTaskComment: {
      comment: {
        id: 'comment-1',
        body: 'Comment',
        updatedAt: DateTime.local(2015, 1, 5, 1, 2).toISO() ?? '',
        me: true,
        person: {
          id: 'person-1',
          firstName: 'John',
          lastName: 'Doe',
        },
      },
    },
  };
  return {
    request: {
      query: CreateTaskCommentDocument,
      variables: {
        accountListId,
        taskId,
        attributes: { id: 'comment-1', body: 'Comment' },
      },
    },
    result: { data },
  };
};

export default completeTaskMutationMock;
