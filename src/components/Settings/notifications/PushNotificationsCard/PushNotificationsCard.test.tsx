import React from 'react';
import { ApolloClient, ApolloProvider } from '@apollo/client';
import { ThemeProvider } from '@mui/material/styles';
import { act, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import {
  emitRegistration,
  emitRegistrationError,
  mockCapacitorCore,
  mockPushNotifications,
  setNativePlatform,
} from '__tests__/util/capacitorMocks';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { UserDevicePlatformEnum } from 'src/graphql/types.generated';
import {
  DestroyUserDeviceMutation,
  RegisterUserDeviceMutation,
} from 'src/lib/nativeShell/UserDevice.generated';
import { resetPushRegistrationStateForTesting } from 'src/lib/nativeShell/pushRegistration';
import {
  isPushEnabled,
  setPushEnabled,
  storeRegistration,
} from 'src/lib/nativeShell/pushStorage';
import theme from 'src/theme';
import { PushNotificationsCard } from './PushNotificationsCard';
import type { PermissionState } from '@capacitor/core';

jest.mock('@capacitor/core', () => mockCapacitorCore);
jest.mock('@capacitor/push-notifications', () => ({
  PushNotifications: mockPushNotifications,
}));
jest.mock('@capacitor/app', () => ({
  App: { getInfo: jest.fn(async () => ({ version: '1.0.0' })) },
}));

const mockEnqueue = jest.fn();

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

interface Mocks {
  RegisterUserDevice: RegisterUserDeviceMutation;
  DestroyUserDevice: DestroyUserDeviceMutation;
}

const mutationSpy = jest.fn();

const Components: React.FC = () => (
  <SnackbarProvider>
    <ThemeProvider theme={theme}>
      <GqlMockedProvider<Mocks>
        mocks={{
          RegisterUserDevice: {
            registerUserDevice: {
              id: 'device-1',
              platform: 'APNS',
              version: '1.0.0',
              locale: 'en-US',
            },
          },
          DestroyUserDevice: {
            destroyUserDevice: { success: true },
          },
        }}
        onCall={mutationSpy}
      >
        <PushNotificationsCard />
      </GqlMockedProvider>
    </ThemeProvider>
  </SnackbarProvider>
);

/**
 * Renders the card with an Apollo client whose every mutation rejects, for
 * failure-path tests (GqlMockedProvider has no operation-level error
 * mechanism).
 */
const renderWithFailingClient = () => {
  const failingClient = {
    mutate: jest.fn().mockRejectedValue(new Error('offline')),
  } as unknown as ApolloClient<object>;
  const view = render(
    <SnackbarProvider>
      <ThemeProvider theme={theme}>
        <ApolloProvider client={failingClient}>
          <PushNotificationsCard />
        </ApolloProvider>
      </ThemeProvider>
    </SnackbarProvider>,
  );
  return { ...view, failingClient };
};

describe('PushNotificationsCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
    resetPushRegistrationStateForTesting();
  });

  describe('on the web', () => {
    it('renders nothing and never touches the plugin', () => {
      setNativePlatform('web');

      const { queryByRole } = render(<Components />);

      expect(queryByRole('button')).not.toBeInTheDocument();
      expect(queryByRole('heading')).not.toBeInTheDocument();
      expect(mockPushNotifications.checkPermissions).not.toHaveBeenCalled();
      expect(mockPushNotifications.requestPermissions).not.toHaveBeenCalled();
      expect(mutationSpy).not.toHaveBeenCalled();
    });
  });

  describe('off state (native, not yet enabled)', () => {
    beforeEach(() => {
      setNativePlatform('ios');
    });

    it('renders the explainer and enable button', async () => {
      const { findByRole, getByText } = render(<Components />);

      expect(
        await findByRole('button', { name: 'Enable Push Notifications' }),
      ).toBeInTheDocument();
      expect(
        getByText(
          'Get notified on this device when important partner events happen, based on the notification types you choose below.',
        ),
      ).toBeInTheDocument();
    });

    it('enables push: requestPermissions, then register, then registers the device and shows the enabled state', async () => {
      const { findByRole, queryByRole } = render(<Components />);

      userEvent.click(
        await findByRole('button', { name: 'Enable Push Notifications' }),
      );

      await waitFor(() =>
        expect(mockPushNotifications.requestPermissions).toHaveBeenCalled(),
      );
      await waitFor(() =>
        expect(mockPushNotifications.register).toHaveBeenCalled(),
      );
      // Prompt must come before registration starts
      expect(
        mockPushNotifications.requestPermissions.mock.invocationCallOrder[0],
      ).toBeLessThan(
        mockPushNotifications.register.mock.invocationCallOrder[0],
      );

      // register() has returned but the device registration has not
      // completed — the card must not claim success yet
      expect(mockEnqueue).not.toHaveBeenCalled();
      expect(
        queryByRole('button', { name: 'Disable on this device' }),
      ).not.toBeInTheDocument();

      await act(async () => {
        await emitRegistration('apns-token');
      });

      expect(mutationSpy).toHaveGraphqlOperation('RegisterUserDevice', {
        input: {
          platform: UserDevicePlatformEnum.Apns,
          token: 'apns-token',
          version: '1.0.0',
          locale: 'en-US',
        },
      });
      expect(
        await findByRole('button', { name: 'Disable on this device' }),
      ).toBeInTheDocument();
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Push notifications enabled on this device',
        { variant: 'success' },
      );
    });

    it('shows the in-progress state until registration completes, then the enabled state', async () => {
      let resolvePermissions: (value: { receive: 'granted' }) => void = () =>
        undefined;
      mockPushNotifications.requestPermissions.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolvePermissions = resolve;
          }),
      );
      const { findByRole, getByRole, queryByRole } = render(<Components />);

      const enableButton = await findByRole('button', {
        name: 'Enable Push Notifications',
      });
      userEvent.click(enableButton);

      await waitFor(() => expect(enableButton).toBeDisabled());
      await waitFor(() =>
        expect(mockPushNotifications.requestPermissions).toHaveBeenCalled(),
      );

      act(() => resolvePermissions({ receive: 'granted' }));
      await waitFor(() =>
        expect(mockPushNotifications.register).toHaveBeenCalled(),
      );

      // Still waiting for the OS token + registration mutation: button stays
      // disabled with a progress indicator, no premature enabled state
      expect(enableButton).toBeDisabled();
      expect(getByRole('progressbar')).toBeInTheDocument();
      expect(
        queryByRole('button', { name: 'Disable on this device' }),
      ).not.toBeInTheDocument();

      await act(async () => {
        await emitRegistration('apns-token');
      });

      expect(
        await findByRole('button', { name: 'Disable on this device' }),
      ).toBeInTheDocument();
    });

    it('shows the instructions alert and never registers when permission is denied', async () => {
      mockPushNotifications.requestPermissions.mockResolvedValueOnce({
        receive: 'denied',
      });
      const { findByRole, findByText, queryByRole } = render(<Components />);

      userEvent.click(
        await findByRole('button', { name: 'Enable Push Notifications' }),
      );

      expect(
        await findByText(/Notifications are turned off for MPDX/),
      ).toBeInTheDocument();
      expect(mockPushNotifications.register).not.toHaveBeenCalled();
      expect(mutationSpy).not.toHaveGraphqlOperation('RegisterUserDevice');
      expect(
        queryByRole('button', { name: 'Enable Push Notifications' }),
      ).not.toBeInTheDocument();
    });
  });

  describe('denied state detected on mount', () => {
    it('shows the instructions alert without prompting', async () => {
      setNativePlatform('ios');
      mockPushNotifications.checkPermissions.mockResolvedValueOnce({
        receive: 'denied',
      });
      const { findByText, queryByRole } = render(<Components />);

      expect(
        await findByText(/Notifications are turned off for MPDX/),
      ).toBeInTheDocument();
      expect(mockPushNotifications.requestPermissions).not.toHaveBeenCalled();
      expect(mockPushNotifications.register).not.toHaveBeenCalled();
      expect(
        queryByRole('button', { name: 'Enable Push Notifications' }),
      ).not.toBeInTheDocument();
    });
  });

  describe('permission loading', () => {
    it('shows a skeleton instead of the enable button while the permission is unresolved', async () => {
      setNativePlatform('ios');
      let resolveCheck: (value: { receive: PermissionState }) => void = () =>
        undefined;
      mockPushNotifications.checkPermissions.mockImplementationOnce(
        () =>
          new Promise<{ receive: PermissionState }>((resolve) => {
            resolveCheck = resolve;
          }),
      );
      const { findByText, getByTestId, queryByRole } = render(<Components />);
      await waitFor(() =>
        expect(mockPushNotifications.checkPermissions).toHaveBeenCalled(),
      );

      // A previously-denied user must not see a flash of the active enable
      // button before the permission read settles
      expect(getByTestId('PushNotificationsCardSkeleton')).toBeInTheDocument();
      expect(queryByRole('button')).not.toBeInTheDocument();

      await act(async () => resolveCheck({ receive: 'denied' }));

      expect(
        await findByText(/Notifications are turned off for MPDX/),
      ).toBeInTheDocument();
    });
  });

  describe('returning from OS Settings', () => {
    it('leaves the denied state when permission is granted and the app becomes visible again', async () => {
      setNativePlatform('ios');
      mockPushNotifications.checkPermissions.mockResolvedValueOnce({
        receive: 'denied',
      });
      const { findByRole, findByText } = render(<Components />);

      expect(
        await findByText(/Notifications are turned off for MPDX/),
      ).toBeInTheDocument();

      // The user follows the alert's instructions: backgrounds the app,
      // allows notifications in OS Settings, and returns — without a remount
      mockPushNotifications.checkPermissions.mockResolvedValueOnce({
        receive: 'granted',
      });
      act(() => {
        document.dispatchEvent(new Event('visibilitychange'));
      });

      expect(
        await findByRole('button', { name: 'Enable Push Notifications' }),
      ).toBeInTheDocument();
    });
  });

  describe('enabled state', () => {
    beforeEach(() => {
      setNativePlatform('ios');
      storeRegistration('device-1', 'apns-token', 'en-US');
      setPushEnabled(true);
      mockPushNotifications.checkPermissions.mockResolvedValueOnce({
        receive: 'granted',
      });
    });

    it('shows the enabled state with a disable button', async () => {
      const { findByRole, findByText } = render(<Components />);

      expect(
        await findByText('Push notifications are enabled on this device.'),
      ).toBeInTheDocument();
      expect(
        await findByRole('button', { name: 'Disable on this device' }),
      ).toBeInTheDocument();
    });

    it('disables push: destroys the device and reverts to the off state', async () => {
      const { findByRole } = render(<Components />);

      userEvent.click(
        await findByRole('button', { name: 'Disable on this device' }),
      );

      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation('DestroyUserDevice', {
          input: { id: 'device-1' },
        }),
      );
      expect(
        await findByRole('button', { name: 'Enable Push Notifications' }),
      ).toBeInTheDocument();
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Push notifications disabled on this device',
        { variant: 'success' },
      );
    });

    it('disables the disable button while the teardown is in flight', async () => {
      let resolveUnregister: () => void = () => undefined;
      mockPushNotifications.unregister.mockImplementationOnce(
        () =>
          new Promise<undefined>((resolve) => {
            resolveUnregister = () => resolve(undefined);
          }),
      );
      const { findByRole } = render(<Components />);

      const disableButton = await findByRole('button', {
        name: 'Disable on this device',
      });
      userEvent.click(disableButton);

      await waitFor(() => expect(disableButton).toBeDisabled());
      await waitFor(() =>
        expect(mockPushNotifications.unregister).toHaveBeenCalled(),
      );

      act(() => resolveUnregister());

      expect(
        await findByRole('button', { name: 'Enable Push Notifications' }),
      ).toBeInTheDocument();
    });

    it('still reverts to the off state when the plugin unregister fails', async () => {
      mockPushNotifications.unregister.mockRejectedValueOnce(
        new Error('bridge gone'),
      );
      const { findByRole } = render(<Components />);

      userEvent.click(
        await findByRole('button', { name: 'Disable on this device' }),
      );

      // disablePush is best-effort: the server row was destroyed and local
      // state cleared, so the card reports the disable as done
      expect(
        await findByRole('button', { name: 'Enable Push Notifications' }),
      ).toBeInTheDocument();
      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation('DestroyUserDevice', {
          input: { id: 'device-1' },
        }),
      );
      expect(isPushEnabled()).toBe(false);
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Push notifications disabled on this device',
        { variant: 'success' },
      );
    });

    it('still reverts to the off state when the DestroyUserDevice mutation rejects (offline)', async () => {
      const { findByRole, failingClient } = renderWithFailingClient();

      userEvent.click(
        await findByRole('button', { name: 'Disable on this device' }),
      );

      // The DELETE never reached the server, but the plugin unregistered and
      // local state is cleared — the device stops receiving pushes, and the
      // backend's stale-device cleanup owns the orphaned row
      expect(
        await findByRole('button', { name: 'Enable Push Notifications' }),
      ).toBeInTheDocument();
      expect(failingClient.mutate).toHaveBeenCalled();
      expect(mockPushNotifications.unregister).toHaveBeenCalled();
      expect(isPushEnabled()).toBe(false);
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Push notifications disabled on this device',
        { variant: 'success' },
      );
    });
  });

  describe('error state', () => {
    beforeEach(() => {
      setNativePlatform('ios');
    });

    it('shows the error alert with a retry button when registration fails', async () => {
      const { findByRole, findByText } = render(<Components />);

      userEvent.click(
        await findByRole('button', { name: 'Enable Push Notifications' }),
      );
      await waitFor(() =>
        expect(mockPushNotifications.register).toHaveBeenCalled(),
      );

      await act(async () => {
        await emitRegistrationError('apns offline');
      });

      expect(
        await findByText(
          'Something went wrong enabling push notifications on this device.',
        ),
      ).toBeInTheDocument();

      // Retry runs the full enable flow again
      userEvent.click(await findByRole('button', { name: 'Retry' }));
      await waitFor(() =>
        expect(mockPushNotifications.requestPermissions).toHaveBeenCalledTimes(
          2,
        ),
      );
    });

    it('shows the error alert and never a success snackbar when the register mutation fails', async () => {
      const { findByRole, findByText } = renderWithFailingClient();

      userEvent.click(
        await findByRole('button', { name: 'Enable Push Notifications' }),
      );
      await waitFor(() =>
        expect(mockPushNotifications.register).toHaveBeenCalled(),
      );

      await act(async () => {
        await emitRegistration('apns-token');
      });

      expect(
        await findByText(
          'Something went wrong enabling push notifications on this device.',
        ),
      ).toBeInTheDocument();
      // No contradictory feedback: success must not have been claimed first
      expect(mockEnqueue).not.toHaveBeenCalledWith(
        'Push notifications enabled on this device',
        { variant: 'success' },
      );
      expect(isPushEnabled()).toBe(false);
    });
  });
});
