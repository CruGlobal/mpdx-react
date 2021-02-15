import React, { ReactElement } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { getDataForTaskDrawerMock } from '../Form/Form.mock';
import {
  ActivityTypeEnum,
  NotificationTypeEnum,
  NotificationTimeUnitEnum,
} from '../../../../../types/globalTypes';
import {
  completeTaskMutationMock,
  completeSimpleTaskMutationMock,
} from './CompleteForm.mock';
import TaskDrawerCompletedForm from '.';

export default {
  title: 'Task/Drawer/CompleteForm',
};

const task = {
  id: 'task-1',
  activityType: ActivityTypeEnum.NEWSLETTER_EMAIL,
  subject: 'On the Journey with the Johnson Family',
  startAt: new Date(2012, 12, 5, 1, 2),
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
  notificationType: NotificationTypeEnum.BOTH,
  notificationTimeUnit: NotificationTimeUnitEnum.HOURS,
};

export const Default = (): ReactElement => {
  return (
    <MockedProvider
      mocks={[
        getDataForTaskDrawerMock(),
        { ...completeSimpleTaskMutationMock(), delay: 500 },
      ]}
      addTypename={false}
    >
      <TaskDrawerCompletedForm
        task={{
          ...task,
          activityType: null,
          completedAt: new Date(2015, 12, 5, 1, 2),
        }}
        accountListId="abc"
        onClose={(): void => {}}
      />
    </MockedProvider>
  );
};

export const WithResults = (): ReactElement => {
  return (
    <MockedProvider
      mocks={[
        getDataForTaskDrawerMock(),
        { ...completeTaskMutationMock(), delay: 500 },
      ]}
      addTypename={false}
    >
      <TaskDrawerCompletedForm
        task={{
          ...task,
          activityType: ActivityTypeEnum.CALL,
          completedAt: new Date(2015, 12, 5, 1, 2),
        }}
        accountListId="abc"
        onClose={(): void => {}}
      />
    </MockedProvider>
  );
};
