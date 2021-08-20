import React, { ReactElement } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import {
  getDataForTaskDrawerMock,
  createTaskMutationMock,
} from '../../../Task/Drawer/Form/Form.mock';
import AddFab from '.';

export default {
  title: 'Layouts/Primary/AddFab',
};

export const Default = (): ReactElement => {
  return (
    <MockedProvider
      mocks={[
        getDataForTaskDrawerMock('abc'),
        { ...createTaskMutationMock(), delay: 500 },
      ]}
      addTypename={false}
    >
      <AddFab />
    </MockedProvider>
  );
};
