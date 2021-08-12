import React, { ReactElement } from 'react';
import { AppBar, Box } from '@material-ui/core';
import { MockedProvider } from '@apollo/client/testing';
import withDispatch from '../../../../../../decorators/withDispatch';
import { getTopBarMock } from '../../TopBar.mock';
import ProfileMenu from './ProfileMenu';

export default {
  title: 'Layouts/Primary/TopBar/Items/ProfileMenu',
  decorators: [
    withDispatch({ type: 'updateAccountListId', accountListId: '1' }),
  ],
};

export const Default = (): ReactElement => {
  const mocks = [getTopBarMock()];
  return (
    <>
      <MockedProvider mocks={mocks} addTypename={false}>
        <AppBar>
          <Box>
            <ProfileMenu />
          </Box>
        </AppBar>
      </MockedProvider>
    </>
  );
};
