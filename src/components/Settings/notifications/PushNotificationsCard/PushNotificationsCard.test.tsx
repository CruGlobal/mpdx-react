import React from 'react';
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
import {
  setPushEnabled,
  storeRegistration,
} from 'src/lib/nativeShell/pushStorage';
import theme from 'src/theme';
import { PushNotificationsCard } from './PushNotificationsCard';

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

describe('PushNotificationsCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
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
      const { findByRole } = render(<Components />);

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

    it('disables the enable button while the flow is in flight', async () => {
      let resolvePermissions: (value: { receive: 'granted' }) => void = () =>
        undefined;
      mockPushNotifications.requestPermissions.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolvePermissions = resolve;
          }),
      );
      const { findByRole } = render(<Components />);

      const enableButton = await findByRole('button', {
        name: 'Enable Push Notifications',
      });
      userEvent.click(enableButton);

      await waitFor(() => expect(enableButton).toBeDisabled());
      await waitFor(() =>
        expect(mockPushNotifications.requestPermissions).toHaveBeenCalled(),
      );

      act(() => resolvePermissions({ receive: 'granted' }));

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
  });
});
