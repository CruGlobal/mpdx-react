import React, { ReactElement } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import withDispatch from '../../../decorators/withDispatch';
import { getDataForTaskDrawerMock } from '../Drawer/Form/Form.mock';
import withMargin from '../../../decorators/withMargin';
import {
  getTasksForTaskListMock,
  getFilteredTasksForTaskListMock,
  getEmptyTasksForTaskListMock,
} from './List.mock';
import TaskList from '.';

export default {
  title: 'Task/List',
  decorators: [
    withDispatch({ type: 'updateAccountListId', accountListId: 'abc' }),
    withMargin,
  ],
};

export const Default = (): ReactElement => (
  <MockedProvider
    mocks={[getTasksForTaskListMock(), getDataForTaskDrawerMock()]}
    addTypename={false}
  >
    <TaskList />
  </MockedProvider>
);

export const Loading = (): ReactElement => (
  <TaskList
    initialFilter={{
      userIds: ['user-1'],
      contactIds: ['contact-1'],
    }}
  />
);

export const Empty = (): ReactElement => (
  <MockedProvider
    mocks={[getEmptyTasksForTaskListMock(), getDataForTaskDrawerMock()]}
    addTypename={false}
  >
    <TaskList />
  </MockedProvider>
);

export const WithInitialFilter = (): ReactElement => {
  const filter = {
    activityType: ['APPOINTMENT'],
    completed: false,
    tags: ['tag-1', 'tag-2'],
    userIds: ['user-1'],
    contactIds: ['contact-1'],
    wildcardSearch: 'journey',
  };
  return (
    <MockedProvider
      mocks={[
        getFilteredTasksForTaskListMock(filter),
        getFilteredTasksForTaskListMock({ ...filter, after: 'B' }),
        getFilteredTasksForTaskListMock({ ...filter, before: 'A' }),
        getDataForTaskDrawerMock(),
      ]}
      addTypename={false}
    >
      <TaskList initialFilter={filter} />
    </MockedProvider>
  );
};
