import React, { ReactElement } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import withDispatch from '../../../decorators/withDispatch';
import {
  getTasksForTaskListMock,
  getFilteredTasksForTaskListMock,
} from '../List/List.mock';
import { getDataForTaskDrawerMock } from '../Drawer/Form/Form.mock';
import { ActivityTypeEnum } from '../../../../graphql/types.generated';
import TaskHome from '.';

export default {
  title: 'Task/Home',
  decorators: [
    withDispatch({ type: 'updateAccountListId', accountListId: 'abc' }),
  ],
};

export const Default = (): ReactElement => (
  <MockedProvider
    mocks={[getTasksForTaskListMock(), getDataForTaskDrawerMock()]}
    addTypename={false}
  >
    <TaskHome />
  </MockedProvider>
);

export const WithInitialFilter = (): ReactElement => {
  const filter = {
    accountListId: 'account-list-1',
    activityType: [ActivityTypeEnum.Appointment],
    completed: true,
  };

  return (
    <MockedProvider
      mocks={[
        getFilteredTasksForTaskListMock(filter),
        getDataForTaskDrawerMock(),
      ]}
      addTypename={false}
    >
      <TaskHome initialFilter={filter} />
    </MockedProvider>
  );
};
