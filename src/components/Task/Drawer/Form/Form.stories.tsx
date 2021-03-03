import React, { ReactElement } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { DateTime } from 'luxon';
import {
  ActivityTypeEnum,
  Contact,
  NotificationTimeUnitEnum,
  NotificationTypeEnum,
  Task,
} from '../../../../../graphql/types.generated';
import {
  getDataForTaskDrawerMock,
  createTaskMutationMock,
  updateTaskMutationMock,
} from './Form.mock';
import TaskDrawerForm from '.';

export default {
  title: 'Task/Drawer/Form',
};

export const Default = (): ReactElement => {
  return (
    <MockedProvider
      mocks={[
        getDataForTaskDrawerMock(),
        { ...createTaskMutationMock(), delay: 500 },
      ]}
      addTypename={false}
    >
      <TaskDrawerForm accountListId="abc" onClose={(): void => {}} />
    </MockedProvider>
  );
};

export const Loading = (): ReactElement => {
  return (
    <MockedProvider mocks={[]} addTypename={false}>
      <TaskDrawerForm accountListId="abc" onClose={(): void => {}} />
    </MockedProvider>
  );
};

const task: Task = {
  id: 'task-1',
  activityType: ActivityTypeEnum.NewsletterEmail,
  subject: 'On the Journey with the Johnson Family',
  startAt: DateTime.local(2012, 1, 5, 1, 2).toISO(),
  completedAt: DateTime.local(2015, 1, 5, 1, 2).toISO(),
  tagList: ['tag-1', 'tag-2'],
  contacts: {
    nodes: [
      { id: 'contact-1', name: 'Anderson, Robert' } as Contact,
      { id: 'contact-2', name: 'Smith, John' } as Contact,
    ],
    pageInfo: { hasNextPage: false, hasPreviousPage: false },
    totalCount: 2,
    totalPageCount: 1,
  },
  user: {
    id: 'user-1',
    firstName: 'Anderson',
    lastName: 'Robert',
    createdAt: 'date-1',
    updatedAt: 'date-2',
  },
  notificationTimeBefore: 20,
  notificationType: NotificationTypeEnum.Both,
  notificationTimeUnit: NotificationTimeUnitEnum.Hours,
  comments: {
    nodes: [],
    pageInfo: { hasNextPage: false, hasPreviousPage: false },
    totalCount: 0,
    totalPageCount: 0,
  },
  createdAt: 'date-1',
  updatedAt: 'date-2',
};

export const Persisted = (): ReactElement => {
  return (
    <MockedProvider
      mocks={[
        getDataForTaskDrawerMock(),
        { ...updateTaskMutationMock(), delay: 500 },
      ]}
      addTypename={false}
    >
      <TaskDrawerForm
        accountListId="abc"
        task={task}
        onClose={(): void => {}}
      />
    </MockedProvider>
  );
};
