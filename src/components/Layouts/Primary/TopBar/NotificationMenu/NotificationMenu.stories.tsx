import React, { ReactElement } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { AppBar, Box } from '@material-ui/core';
import withDispatch from '../../../../../decorators/withDispatch';
import {
  getNotificationsMocks,
  getNotificationsEmptyMock,
  getNotificationsLoadingMock,
  acknowledgeAllUserNotificationsMutationMock,
} from './NotificationMenu.mock';
import NotificationMenu from '.';

export default {
  title: 'Layouts/Primary/TopBar/NotificationMenu',
  decorators: [
    withDispatch(
      { type: 'updateAccountListId', accountListId: '1' },
      { type: 'updateBreadcrumb', breadcrumb: 'Dashboard' },
    ),
  ],
};

export const Default = (): ReactElement => {
  return (
    <>
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
    </>
  );
};

export const Empty = (): ReactElement => {
  return (
    <>
      <MockedProvider mocks={[getNotificationsEmptyMock()]} addTypename={false}>
        <AppBar>
          <Box>
            <NotificationMenu />
          </Box>
        </AppBar>
      </MockedProvider>
    </>
  );
};

export const Loading = (): ReactElement => {
  return (
    <>
      <MockedProvider
        mocks={[getNotificationsLoadingMock()]}
        addTypename={false}
      >
        <AppBar>
          <Box>
            <NotificationMenu />
          </Box>
        </AppBar>
      </MockedProvider>
    </>
  );
};
