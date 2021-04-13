import React, { ReactElement } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { DateTime } from 'luxon';
import { InMemoryCache } from '@apollo/client';
import {
  ActivityTypeEnum,
  Contact,
} from '../../../../../graphql/types.generated';
import { getTasksForTaskListMock } from '../../List/List.mock';
import {
  GetTasksForTaskListDocument,
  GetTasksForTaskListQuery,
} from '../../List/TaskList.generated';
import {
  getDataForTaskDrawerMock,
  createTaskMutationMock,
  updateTaskMutationMock,
  deleteTaskMutationMock,
  getDataForTaskDrawerLoadingMock,
} from './Form.mock';
import TaskDrawerForm from '.';

export default {
  title: 'Task/Drawer/Form',
};

const accountListId = 'abc';

const mockFilter = {
  userIds: [],
  tags: [],
  contactIds: [],
  activityType: [],
  completed: null,
  startAt: null,
  before: null,
  after: null,
};

export const Default = (): ReactElement => {
  return (
    <MockedProvider
      mocks={[
        getDataForTaskDrawerMock(accountListId),
        { ...createTaskMutationMock(), delay: 500 },
      ]}
      addTypename={false}
    >
      <TaskDrawerForm
        accountListId={accountListId}
        filter={mockFilter}
        rowsPerPage={100}
        onClose={(): void => {}}
      />
    </MockedProvider>
  );
};

export const Loading = (): ReactElement => {
  return (
    <MockedProvider
      mocks={[getDataForTaskDrawerLoadingMock(accountListId)]}
      addTypename={false}
    >
      <TaskDrawerForm
        accountListId={accountListId}
        filter={mockFilter}
        rowsPerPage={100}
        onClose={(): void => {}}
      />
    </MockedProvider>
  );
};

const task: GetTasksForTaskListQuery['tasks']['nodes'][0] = {
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
  },
  user: {
    id: 'user-1',
    firstName: 'Anderson',
    lastName: 'Robert',
  },
};

export const Persisted = (): ReactElement => {
  const cache = new InMemoryCache({ addTypename: false });
  const query = {
    query: GetTasksForTaskListDocument,
    variables: {
      accountListId,
      first: 100,
      ...mockFilter,
    },
    data: {
      tasks: {
        nodes: [{ ...task }],
      },
    },
  };
  cache.writeQuery(query);
  return (
    <MockedProvider
      mocks={[
        getDataForTaskDrawerMock(accountListId),
        getTasksForTaskListMock(accountListId),
        { ...updateTaskMutationMock(), delay: 500 },
        { ...deleteTaskMutationMock(), delay: 1000 },
      ]}
      cache={cache}
      addTypename={false}
    >
      <TaskDrawerForm
        accountListId={accountListId}
        filter={mockFilter}
        rowsPerPage={100}
        task={task}
        onClose={(): void => {}}
      />
    </MockedProvider>
  );
};
