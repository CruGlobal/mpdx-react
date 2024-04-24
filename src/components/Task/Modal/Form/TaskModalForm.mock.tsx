import { MockedResponse } from '@apollo/client/testing';
import { DateTime } from 'luxon';
import { LoadConstantsQuery } from 'src/components/Constants/LoadConstants.generated';
import {
  ActivityTypeEnum,
  NotificationTimeUnitEnum,
  NotificationTypeEnum,
  PhaseEnum,
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

export const LoadConstants: LoadConstantsQuery = {
  constant: {
    activities: [
      {
        id: 'Appointment - In Person',
        value: 'Appointment - In Person',
        __typename: 'IdValue',
      },
      {
        id: 'Follow Up - Email',
        value: 'Follow Up - Email',
        __typename: 'IdValue',
      },
    ],
    statuses: [
      {
        id: 'NEW_CONNECTION',
        value: 'New Connection',
        __typename: 'IdValue',
      },
      {
        id: 'APPOINTMENT_SCHEDULED',
        value: 'Appointment Scheduled',
        __typename: 'IdValue',
      },
    ],
    phases: [
      {
        id: PhaseEnum.Connection,
        tasks: [],
        results: {
          tags: null,
          resultOptions: [],
          __typename: 'Result',
        },
        name: 'Connection',
        contactStatuses: [
          {
            value: 'New Connection',
            id: 'New Connection',
            __typename: 'IdValue',
          },
          {
            value: 'Ask in Future',
            id: 'Ask in Future',
            __typename: 'IdValue',
          },
        ],
        __typename: 'Phase',
      },
      {
        id: PhaseEnum.Appointment,
        tasks: [
          {
            id: 'Appointment - In Person',
            value: 'In Person Appointment',
            __typename: 'IdValue',
          },
          {
            id: 'Appointment - Phone Call',
            value: 'Phone Appointment',
            __typename: 'IdValue',
          },
        ],
        results: {
          tags: [
            {
              id: 'asked for support',
              value: 'asked for support',
              __typename: 'IdValue',
            },
            {
              id: 'asked for connections',
              value: 'asked for connections',
              __typename: 'IdValue',
            },
          ],
          resultOptions: [
            {
              suggestedNextActions: [
                {
                  value: 'Initiation - Phone Call',
                  id: 'Initiation - Phone Call',
                  __typename: 'IdValue',
                },
                {
                  value: 'Initiation - Email',
                  id: 'Initiation - Email',
                  __typename: 'IdValue',
                },
                {
                  value: 'Initiation - Text Message',
                  id: 'Initiation - Text Message',
                  __typename: 'IdValue',
                },
              ],
              name: {
                id: 'cancelled',
                value: 'Cancelled',
                __typename: 'IdValue',
              },
              suggestedContactStatus: 'Initiate for Appointment',
              dbResult: [
                {
                  key: 'Appointment - In Person',
                  value: 'Attempted',
                  id: 'Attempted',
                  __typename: 'IdKeyValue',
                },
                {
                  key: 'Appointment - Video Call',
                  value: 'Attempted',
                  id: 'Attempted',
                  __typename: 'IdKeyValue',
                },
              ],
              __typename: 'ResultOption',
            },
            {
              suggestedNextActions: [
                {
                  value: 'Follow Up - Phone Call',
                  id: 'Follow Up - Phone Call',
                  __typename: 'IdValue',
                },
                {
                  value: 'Follow Up - Email',
                  id: 'Follow Up - Email',
                  __typename: 'IdValue',
                },
              ],
              name: {
                id: 'follow up',
                value: 'Follow Up',
                __typename: 'IdValue',
              },
              suggestedContactStatus: 'Follow Up for Decision',
              dbResult: [
                {
                  key: 'Appointment - In Person',
                  value: 'Completed',
                  id: 'Completed',
                  __typename: 'IdKeyValue',
                },
                {
                  key: 'Appointment - Video Call',
                  value: 'Completed',
                  id: 'Completed',
                  __typename: 'IdKeyValue',
                },
              ],
              __typename: 'ResultOption',
            },
            {
              suggestedNextActions: [
                {
                  value: 'Partner Care - Thank',
                  id: 'Partner Care - Thank',
                  __typename: 'IdValue',
                },
              ],
              name: {
                id: 'Partner - Financial',
                value: 'Partner - Financial',
                __typename: 'IdValue',
              },
              suggestedContactStatus: 'Partner - Financial',
              dbResult: [
                {
                  key: 'Appointment - In Person',
                  value: 'Completed',
                  id: 'Completed',
                  __typename: 'IdKeyValue',
                },
                {
                  key: 'Appointment - Video Call',
                  value: 'Completed',
                  id: 'Completed',
                  __typename: 'IdKeyValue',
                },
              ],
              __typename: 'ResultOption',
            },
          ],
          __typename: 'Result',
        },
        name: 'Appointment',
        contactStatuses: [
          {
            value: 'Appointment Scheduled',
            id: 'Appointment Scheduled',
            __typename: 'IdValue',
          },
        ],
        __typename: 'Phase',
      },
    ],
    __typename: 'Constant',
  },
};
