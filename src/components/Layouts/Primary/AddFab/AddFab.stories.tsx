import React, { ReactElement } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import {
  getDataForTaskDrawerMock,
  createTaskMutationMock,
} from '../../../Task/Drawer/Form/Form.mock';
import withDispatch from '../../../../decorators/withDispatch';
import AddFab from '.';

export default {
  title: 'Layouts/Primary/AddFab',
  decorators: [
    withDispatch({ type: 'updateAccountListId', accountListId: 'abc' }),
  ],
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
