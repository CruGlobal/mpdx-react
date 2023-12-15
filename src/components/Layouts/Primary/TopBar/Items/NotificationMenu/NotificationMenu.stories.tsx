import React, { ReactElement } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { AppBar, Box } from '@mui/material';
import NotificationMenu from './NotificationMenu';
import {
  acknowledgeAllUserNotificationsMutationMock,
  getNotificationsEmptyMock,
  getNotificationsLoadingMock,
  getNotificationsMocks,
} from './NotificationMenu.mock';

export default {
  title: 'Layouts/Primary/TopBar/Items/NotificationMenu',
};

export const Default = (): ReactElement => {
  return (
    <MockedProvider
      mocks={[
        ...getNotificationsMocks(),
        acknowledgeAllUserNotificationsMutationMock(),
      ]}
      addTypename={false}
    >
      <AppBar>
        <Box>
          <NotificationMenu />
        </Box>
      </AppBar>
    </MockedProvider>
  );
};

export const Empty = (): ReactElement => {
  return (
    <MockedProvider mocks={[getNotificationsEmptyMock()]} addTypename={false}>
      <AppBar>
        <Box>
          <NotificationMenu />
        </Box>
      </AppBar>
    </MockedProvider>
  );
};

export const Loading = (): ReactElement => {
  return (
    <MockedProvider mocks={[getNotificationsLoadingMock()]} addTypename={false}>
      <AppBar>
        <Box>
          <NotificationMenu />
        </Box>
      </AppBar>
    </MockedProvider>
  );
};
