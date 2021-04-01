import React, { ReactElement } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { DateTime } from 'luxon';
import { getDataForTaskDrawerMock } from '../Form/Form.mock';
import {
  ActivityTypeEnum,
  NotificationTimeUnitEnum,
  NotificationTypeEnum,
} from '../../../../../graphql/types.generated';
import {
  completeTaskMutationMock,
  completeSimpleTaskMutationMock,
} from './CompleteForm.mock';
import TaskDrawerCompletedForm from '.';

export default {
  title: 'Task/Drawer/CompleteForm',
};

const accountListId = 'abc';
const taskId = 'task-1';

const task = {
  id: taskId,
  activityType: ActivityTypeEnum.NewsletterEmail,
  subject: 'On the Journey with the Johnson Family',
  startAt: DateTime.local(2012, 1, 5, 1, 2).toISO(),
  completedAt: null,
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
};

export const Default = (): ReactElement => {
  return (
    <MockedProvider
      mocks={[
        getDataForTaskDrawerMock(accountListId),
        {
          ...completeSimpleTaskMutationMock(accountListId, taskId),
          delay: 500,
        },
      ]}
      addTypename={false}
    >
      <TaskDrawerCompletedForm
        task={{
          ...task,
          activityType: null,
          completedAt: DateTime.local(2015, 1, 5, 1, 2).toISO(),
        }}
        accountListId={accountListId}
        onClose={(): void => {}}
      />
    </MockedProvider>
  );
};

export const WithResults = (): ReactElement => {
  return (
    <MockedProvider
      mocks={[
        getDataForTaskDrawerMock(accountListId),
        { ...completeTaskMutationMock(accountListId, taskId), delay: 500 },
      ]}
      addTypename={false}
    >
      <TaskDrawerCompletedForm
        task={{
          ...task,
          activityType: ActivityTypeEnum.Call,
          completedAt: DateTime.local(2015, 1, 5, 1, 2).toISO(),
        }}
        accountListId={accountListId}
        onClose={(): void => {}}
      />
    </MockedProvider>
  );
};
