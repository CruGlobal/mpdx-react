import React, { ReactElement } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import {
  getTasksForTaskListMock,
  getFilteredTasksForTaskListMock,
} from '../List/List.mock';
import { getDataForTaskModalMock } from '../Modal/Form/TaskModalForm.mock';
import { ActivityTypeEnum } from '../../../../graphql/types.generated';
import TaskHome from '.';

const accountListId = 'abc';

export default {
  title: 'Task/Home',
};

export const Default = (): ReactElement => (
  <MockedProvider
    mocks={[
      getTasksForTaskListMock(accountListId),
      getDataForTaskModalMock(accountListId),
    ]}
    addTypename={false}
  >
    <TaskHome />
  </MockedProvider>
);

export const WithInitialFilter = (): ReactElement => {
  const filter = {
    accountListId,
    activityType: [ActivityTypeEnum.Appointment],
    completed: true,
  };

  return (
    <MockedProvider
      mocks={[
        getFilteredTasksForTaskListMock(accountListId, filter),
        getDataForTaskModalMock(accountListId),
      ]}
      addTypename={false}
    >
      <TaskHome initialFilter={filter} />
    </MockedProvider>
  );
};
