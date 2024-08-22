import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { notificationSettingsMocks } from 'src/components/Settings/notifications/notificationSettingsMocks';
import theme from 'src/theme';
import Notifications from './notifications.page';

const accountListId = 'account-list-1';

const mockEnqueue = jest.fn();
const mutationSpy = jest.fn();
const push = jest.fn();

const router = {
  query: { accountListId },
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

const MocksProviders = (props: { children: JSX.Element; setup?: string }) => (
  <ThemeProvider theme={theme}>
    <TestRouter router={router}>
      <GqlMockedProvider
        mocks={{
          notificationSettingsMocks,
          GetUserOptions: {
            userOptions: [
              {
                id: 1,
                key: 'setup_position',
                value: props.setup || 'finish',
              },
            ],
          },
        }}
        onCall={mutationSpy}
      >
        {props.children}
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
        <MocksProviders setup="start">
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
        <MocksProviders setup="preferences.notifications">
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
      const { getAllByRole, findByText } = render(
        <MocksProviders setup="preferences.notifications">
          <Notifications />
        </MocksProviders>,
      );

      expect(
        await findByText('Setup your notifications here'),
      ).toBeInTheDocument();

      const saveButton = getAllByRole('button', { name: 'Save Changes' })[0];

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
