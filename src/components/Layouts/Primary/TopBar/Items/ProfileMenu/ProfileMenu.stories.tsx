import React, { ReactElement } from 'react';
import { AppBar, Box } from '@mui/material';
import { MockedProvider } from '@apollo/client/testing';
import { getTopBarMock } from '../../TopBar.mock';
import ProfileMenu from './ProfileMenu';

export default {
  title: 'Layouts/Primary/TopBar/Items/ProfileMenu',
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
