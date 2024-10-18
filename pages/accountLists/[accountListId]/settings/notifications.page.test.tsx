import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import {
  NotificationTypesQuery,
  NotificationsPreferencesQuery,
} from 'src/components/Settings/notifications/Notifications.generated';
import { notificationSettingsMocks } from 'src/components/Settings/notifications/notificationSettingsMocks';
import { TestSetupProvider } from 'src/components/Setup/SetupProvider';
import theme from 'src/theme';
import Notifications from './notifications.page';

const accountListId = 'account-list-1';

const mockEnqueue = jest.fn();
const mutationSpy = jest.fn();
const push = jest.fn();

const router = {
  query: { accountListId },
  pathname: '/accountLists/[accountListId]/settings/notifications',
  isReady: true,
  push,
};

jest.mock('notistack', () => ({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ...jest.requireActual('notistack'),
  useSnackbar: () => {
    return {
      enqueueSnackbar: mockEnqueue,
    };
  },
}));

interface MocksProvidersProps {
  children: JSX.Element;
  setup?: boolean;
}

const MocksProviders: React.FC<MocksProvidersProps> = ({
  children,
  setup = false,
}) => (
  <ThemeProvider theme={theme}>
    <TestRouter router={router}>
      <GqlMockedProvider<{
        NotificationsPreferences: NotificationsPreferencesQuery;
        NotificationTypes: NotificationTypesQuery;
      }>
        mocks={{
          ...notificationSettingsMocks,
        }}
        onCall={mutationSpy}
      >
        <TestSetupProvider onSetupTour={setup}>{children}</TestSetupProvider>
      </GqlMockedProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('Notifications page', () => {
  it('should render page', async () => {
    const { findByText, getByTestId, queryByTestId } = render(
      <MocksProviders>
        <Notifications />
      </MocksProviders>,
    );
    await waitFor(() => {
      expect(queryByTestId('skeleton-notifications')).not.toBeInTheDocument();
    });
    expect(await findByText('Notifications')).toBeInTheDocument();
    expect(getByTestId('select-all-app')).toBeInTheDocument();
  });

  describe('Setup Tour', () => {
    it('should not show setup banner', async () => {
      const { queryByText, findByText } = render(
        <MocksProviders>
          <Notifications />
        </MocksProviders>,
      );

      expect(await findByText('Notifications')).toBeInTheDocument();
      await waitFor(() => {
        expect(
          queryByText('Setup your notifications here'),
        ).not.toBeInTheDocument();
      });
    });

    it('should show setup banner move to the next part', async () => {
      const { findByText, getByRole } = render(
        <MocksProviders setup>
          <Notifications />
        </MocksProviders>,
      );

      expect(
        await findByText('Setup your notifications here'),
      ).toBeInTheDocument();

      const skipButton = getByRole('button', { name: 'Skip Step' });
      userEvent.click(skipButton);

      // Move to Integrations
      userEvent.click(skipButton);
      await waitFor(() => {
        expect(mutationSpy).toHaveGraphqlOperation('UpdateUserOptions', {
          key: 'setup_position',
          value: 'preferences.integrations',
        });
        expect(push).toHaveBeenCalledWith(
          '/accountLists/account-list-1/settings/integrations',
        );
      });
    });

    it('moves to the next section with Save Button', async () => {
      const { findAllByRole, findByText } = render(
        <MocksProviders setup>
          <Notifications />
        </MocksProviders>,
      );

      expect(
        await findByText('Setup your notifications here'),
      ).toBeInTheDocument();

      const saveButton = (
        await findAllByRole('button', {
          name: 'Save Changes',
        })
      )[0];

      // Move to Integrations
      userEvent.click(saveButton);
      await waitFor(() => {
        expect(mutationSpy).toHaveGraphqlOperation('UpdateUserOptions', {
          key: 'setup_position',
          value: 'preferences.integrations',
        });
        expect(push).toHaveBeenCalledWith(
          '/accountLists/account-list-1/settings/integrations',
        );
      });
    });
  });
});
