import { MockedResponse } from '@apollo/client/testing';
import { DateTime } from 'luxon';
import { LoadConstantsQuery } from 'src/components/Constants/LoadConstants.generated';
import {
  ActivityTypeEnum,
  DisplayResultEnum,
  NotificationTimeUnitEnum,
  NotificationTypeEnum,
  PhaseEnum,
  ResultEnum,
  StatusEnum,
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
        value: 'Appointment - In Person',
        id: ActivityTypeEnum.AppointmentInPerson,
      },
      {
        value: 'Follow Up - Email',
        id: ActivityTypeEnum.FollowUpEmail,
      },
    ],
    statuses: [
      {
        id: 'NEVER_CONTACTED',
        value: 'New Connection',
      },
      {
        id: 'APPOINTMENT_SCHEDULED',
        value: 'Appointment Scheduled',
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
        contactStatuses: [StatusEnum.NeverContacted, StatusEnum.AskInFuture],
        __typename: 'Phase',
      },
      {
        id: PhaseEnum.Appointment,
        tasks: [
          ActivityTypeEnum.AppointmentInPerson,
          ActivityTypeEnum.AppointmentPhoneCall,
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
                ActivityTypeEnum.InitiationPhoneCall,
                ActivityTypeEnum.InitiationEmail,
                ActivityTypeEnum.InitiationTextMessage,
              ],
              name: DisplayResultEnum.AppointmentResultCancelled,
              suggestedContactStatus: StatusEnum.NotInterested,
              dbResult: [
                {
                  task: ActivityTypeEnum.AppointmentInPerson,
                  result: ResultEnum.Attempted,
                },
                {
                  task: ActivityTypeEnum.AppointmentVideoCall,
                  result: ResultEnum.Attempted,
                },
              ],
              __typename: 'ResultOption',
            },
            {
              suggestedNextActions: [
                ActivityTypeEnum.FollowUpPhoneCall,
                ActivityTypeEnum.FollowUpEmail,
              ],
              name: DisplayResultEnum.FollowUpResultNotInterested,
              suggestedContactStatus: StatusEnum.CultivateRelationship,
              dbResult: [
                {
                  task: ActivityTypeEnum.AppointmentInPerson,
                  result: ResultEnum.Completed,
                },
                {
                  task: ActivityTypeEnum.AppointmentVideoCall,
                  result: ResultEnum.Completed,
                },
              ],
              __typename: 'ResultOption',
            },
            {
              suggestedNextActions: [ActivityTypeEnum.FollowUpPhoneCall],
              name: DisplayResultEnum.FollowUpResultPartnerFinancial,
              suggestedContactStatus: StatusEnum.PartnerFinancial,
              dbResult: [
                {
                  task: ActivityTypeEnum.AppointmentInPerson,
                  result: ResultEnum.Completed,
                },
                {
                  task: ActivityTypeEnum.AppointmentVideoCall,
                  result: ResultEnum.Completed,
                },
              ],
              __typename: 'ResultOption',
            },
          ],
          __typename: 'Result',
        },
        name: 'Appointment',
        contactStatuses: [StatusEnum.AppointmentScheduled],
        __typename: 'Phase',
      },
    ],
    __typename: 'Constant',
  },
};
