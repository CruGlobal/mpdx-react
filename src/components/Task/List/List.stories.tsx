import React, { ReactElement } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import {
  getDataForTaskModalMock,
  getDataForTaskModalLoadingMock,
} from '../Modal/Form/TaskModalForm.mock';
import withMargin from '../../../decorators/withMargin';
import { ActivityTypeEnum } from '../../../../graphql/types.generated';
import {
  getTasksForTaskListMock,
  getFilteredTasksForTaskListMock,
  getEmptyTasksForTaskListMock,
  getTasksForTaskListLoadingMock,
  getTasksForTaskListErrorMock,
} from './List.mock';
import TaskList from '.';

const accountListId = 'abc';

export default {
  title: 'Task/List',
  decorators: [withMargin],
};

export const Default = (): ReactElement => (
  <MockedProvider
    mocks={[
      getTasksForTaskListMock(accountListId),
      getDataForTaskModalMock(accountListId),
    ]}
    addTypename={false}
  >
    <TaskList />
  </MockedProvider>
);

export const Loading = (): ReactElement => (
  <MockedProvider
    mocks={[
      getTasksForTaskListLoadingMock(accountListId),
      getDataForTaskModalLoadingMock(accountListId),
    ]}
    addTypename={false}
  >
    <TaskList />
  </MockedProvider>
);

export const Empty = (): ReactElement => (
  <MockedProvider
    mocks={[
      getEmptyTasksForTaskListMock(accountListId),
      getDataForTaskModalMock(accountListId),
    ]}
    addTypename={false}
  >
    <TaskList />
  </MockedProvider>
);

export const WithInitialFilter = (): ReactElement => {
  const filter = {
    accountListId: 'account-list-1',
    activityType: [ActivityTypeEnum.Appointment],
    completed: false,
    tags: ['tag-1', 'tag-2'],
    userIds: ['user-1'],
    contactIds: ['contact-1'],
    wildcardSearch: 'journey',
  };
  return (
    <MockedProvider
      mocks={[
        getFilteredTasksForTaskListMock(accountListId, filter),
        getFilteredTasksForTaskListMock(accountListId, {
          ...filter,
          after: 'B',
        }),
        getFilteredTasksForTaskListMock(accountListId, {
          ...filter,
          before: 'A',
        }),
        getDataForTaskModalMock(accountListId),
      ]}
      addTypename={false}
    >
      <TaskList initialFilter={filter} />
    </MockedProvider>
  );
};

export const Error = (): ReactElement => (
  <MockedProvider
    mocks={[
      getTasksForTaskListErrorMock(accountListId),
      getDataForTaskModalMock(accountListId),
    ]}
    addTypename={false}
  >
    <TaskList />
  </MockedProvider>
);
