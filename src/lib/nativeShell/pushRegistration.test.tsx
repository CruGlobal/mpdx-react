import React, { useEffect } from 'react';
import { ApolloClient, Operation, useApolloClient } from '@apollo/client';
import { render } from '@testing-library/react';
import { DeepPartial } from 'ts-essentials';
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
} from './UserDevice.generated';
import {
  disablePush,
  enablePush,
  startPushRegistration,
} from './pushRegistration';
import {
  getStoredDeviceId,
  getStoredLocale,
  getStoredToken,
  isPushEnabled,
  setPushEnabled,
  storeRegistration,
} from './pushStorage';

const mockGetInfo = jest.fn();

jest.mock('@capacitor/core', () => mockCapacitorCore);
jest.mock('@capacitor/push-notifications', () => ({
  PushNotifications: mockPushNotifications,
}));
jest.mock('@capacitor/app', () => ({
  App: { getInfo: mockGetInfo },
}));

interface Mocks {
  RegisterUserDevice: RegisterUserDeviceMutation;
  DestroyUserDevice: DestroyUserDeviceMutation;
}

const ClientProbe: React.FC<{
  onClient: (client: ApolloClient<object>) => void;
}> = ({ onClient }) => {
  const client = useApolloClient();
  useEffect(() => {
    onClient(client);
  }, [client, onClient]);
  return null;
};

const renderClient = (mocks?: DeepPartial<Mocks>) => {
  const mutationSpy = jest.fn();
  let client: ApolloClient<object> | undefined;
  render(
    <GqlMockedProvider<Mocks> mocks={mocks} onCall={mutationSpy}>
      <ClientProbe
        onClient={(apolloClient) => {
          client = apolloClient;
        }}
      />
    </GqlMockedProvider>,
  );
  if (!client) {
    throw new Error('Apollo client was not initialized');
  }
  return { client, mutationSpy };
};

const registerMocks: DeepPartial<Mocks> = {
  RegisterUserDevice: {
    registerUserDevice: { id: 'device-1' },
  },
};

/**
 * Client stub whose every mutation rejects, for failure-tolerance tests
 * (GqlMockedProvider has no operation-level error mechanism).
 */
const makeFailingClient = (): ApolloClient<object> =>
  ({
    mutate: jest.fn().mockRejectedValue(new Error('offline')),
  }) as unknown as ApolloClient<object>;

const operationCount = (spy: jest.Mock, operationName: string): number =>
  spy.mock.calls.filter(
    ([call]: [{ operation: Operation }]) =>
      call.operation.operationName === operationName,
  ).length;

describe('pushRegistration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
    mockGetInfo.mockResolvedValue({ version: '1.0.0' });
  });

  describe('on the web', () => {
    beforeEach(() => {
      setNativePlatform('web');
    });

    it('enablePush returns unavailable without touching the plugin or the network', async () => {
      const { client, mutationSpy } = renderClient();

      await expect(enablePush(client, 'en')).resolves.toBe('unavailable');

      expect(mockPushNotifications.requestPermissions).not.toHaveBeenCalled();
      expect(mockPushNotifications.addListener).not.toHaveBeenCalled();
      expect(mockPushNotifications.register).not.toHaveBeenCalled();
      expect(mutationSpy).not.toHaveBeenCalled();
    });

    it('startPushRegistration is a no-op', async () => {
      const { client, mutationSpy } = renderClient();

      await startPushRegistration(client, 'en');

      expect(mockPushNotifications.addListener).not.toHaveBeenCalled();
      expect(mockPushNotifications.register).not.toHaveBeenCalled();
      expect(mutationSpy).not.toHaveBeenCalled();
    });

    it('disablePush is a no-op', async () => {
      storeRegistration('device-1', 'tok', 'en');
      setPushEnabled(true);
      const { client, mutationSpy } = renderClient();

      await disablePush(client);

      expect(mutationSpy).not.toHaveBeenCalled();
      expect(mockPushNotifications.unregister).not.toHaveBeenCalled();
      // Web signout paths never registered a device, so nothing is cleared
      expect(getStoredDeviceId()).toBe('device-1');
    });
  });

  describe('enablePush on iOS', () => {
    beforeEach(() => {
      setNativePlatform('ios');
    });

    it('registers the device under the APNS platform when the OS issues a token', async () => {
      const { client, mutationSpy } = renderClient(registerMocks);

      await expect(enablePush(client, 'en')).resolves.toBe('granted');
      expect(mockPushNotifications.requestPermissions).toHaveBeenCalled();
      expect(mockPushNotifications.register).toHaveBeenCalled();
      expect(mutationSpy).not.toHaveBeenCalled();

      await emitRegistration('apns-token');

      expect(mutationSpy).toHaveGraphqlOperation('RegisterUserDevice', {
        input: {
          platform: UserDevicePlatformEnum.Apns,
          token: 'apns-token',
          version: '1.0.0',
          locale: 'en',
        },
      });
    });

    it('stores the server device id, token, and locale and sets the enabled flag', async () => {
      const { client } = renderClient(registerMocks);

      await enablePush(client, 'en');
      await emitRegistration('apns-token');

      expect(getStoredDeviceId()).toBe('device-1');
      expect(getStoredToken()).toBe('apns-token');
      expect(getStoredLocale()).toBe('en');
      expect(isPushEnabled()).toBe(true);
    });

    it('maps the frontend locale to an API-accepted locale', async () => {
      const { client, mutationSpy } = renderClient(registerMocks);

      await enablePush(client, 'fr');
      await emitRegistration('apns-token');

      expect(mutationSpy).toHaveGraphqlOperation('RegisterUserDevice', {
        input: {
          platform: UserDevicePlatformEnum.Apns,
          token: 'apns-token',
          version: '1.0.0',
          locale: 'fr-FR',
        },
      });
      expect(getStoredLocale()).toBe('fr-FR');
    });

    it('falls back to version 0.0.0 when the shell version is unavailable', async () => {
      mockGetInfo.mockRejectedValueOnce(new Error('no bridge'));
      const { client, mutationSpy } = renderClient(registerMocks);

      await enablePush(client, 'en');
      await emitRegistration('apns-token');

      expect(mutationSpy).toHaveGraphqlOperation('RegisterUserDevice', {
        input: {
          platform: UserDevicePlatformEnum.Apns,
          token: 'apns-token',
          version: '0.0.0',
          locale: 'en',
        },
      });
    });
  });

  describe('enablePush on Android', () => {
    it('registers the device under the GCM platform', async () => {
      setNativePlatform('android');
      const { client, mutationSpy } = renderClient(registerMocks);

      await enablePush(client, 'en');
      await emitRegistration('fcm-token');

      expect(mutationSpy).toHaveGraphqlOperation('RegisterUserDevice', {
        input: {
          platform: UserDevicePlatformEnum.Gcm,
          token: 'fcm-token',
          version: '1.0.0',
          locale: 'en',
        },
      });
    });
  });

  describe('permission denied', () => {
    it('returns denied and never calls register', async () => {
      setNativePlatform('ios');
      mockPushNotifications.requestPermissions.mockResolvedValueOnce({
        receive: 'denied',
      });
      const { client, mutationSpy } = renderClient();

      await expect(enablePush(client, 'en')).resolves.toBe('denied');

      expect(mockPushNotifications.register).not.toHaveBeenCalled();
      expect(mockPushNotifications.addListener).not.toHaveBeenCalled();
      expect(mutationSpy).not.toHaveBeenCalled();
    });
  });

  describe('idempotent re-registration and token rotation', () => {
    beforeEach(() => {
      setNativePlatform('ios');
    });

    it('skips the network when the same token is issued again', async () => {
      const { client, mutationSpy } = renderClient(registerMocks);
      await enablePush(client, 'en');

      await emitRegistration('apns-token');
      await emitRegistration('apns-token');

      expect(operationCount(mutationSpy, 'RegisterUserDevice')).toBe(1);
    });

    it('makes zero network calls on a steady-state relaunch registration', async () => {
      const { client, mutationSpy } = renderClient(registerMocks);
      await enablePush(client, 'en');
      await emitRegistration('apns-token');
      expect(operationCount(mutationSpy, 'RegisterUserDevice')).toBe(1);

      // Next launch: PushBootstrap re-runs the registration flow
      await startPushRegistration(client, 'en');
      await emitRegistration('apns-token');

      expect(operationCount(mutationSpy, 'RegisterUserDevice')).toBe(1);
    });

    it('re-registers when the token rotates', async () => {
      const { client, mutationSpy } = renderClient(registerMocks);
      await enablePush(client, 'en');
      await emitRegistration('apns-token');

      await emitRegistration('rotated-token');

      expect(mutationSpy).toHaveGraphqlOperation('RegisterUserDevice', {
        input: {
          platform: UserDevicePlatformEnum.Apns,
          token: 'rotated-token',
          version: '1.0.0',
          locale: 'en',
        },
      });
      expect(operationCount(mutationSpy, 'RegisterUserDevice')).toBe(2);
      expect(getStoredToken()).toBe('rotated-token');
      expect(getStoredDeviceId()).toBe('device-1');
    });

    it('re-registers when the locale changes', async () => {
      const { client, mutationSpy } = renderClient(registerMocks);
      await enablePush(client, 'en');
      await emitRegistration('apns-token');

      await startPushRegistration(client, 'de');
      await emitRegistration('apns-token');

      expect(mutationSpy).toHaveGraphqlOperation('RegisterUserDevice', {
        input: {
          platform: UserDevicePlatformEnum.Apns,
          token: 'apns-token',
          version: '1.0.0',
          locale: 'de',
        },
      });
      expect(getStoredLocale()).toBe('de');
    });
  });

  describe('registration errors', () => {
    beforeEach(() => {
      setNativePlatform('ios');
    });

    it('surfaces registrationError events through the callback', async () => {
      const onRegistrationError = jest.fn();
      const { client } = renderClient();

      await enablePush(client, 'en', onRegistrationError);
      await emitRegistrationError('apns offline');

      expect(onRegistrationError).toHaveBeenCalledWith({
        error: 'apns offline',
      });
    });

    it('stores nothing and surfaces the error when the register mutation fails', async () => {
      const onRegistrationError = jest.fn();
      const failingClient = makeFailingClient();

      await startPushRegistration(failingClient, 'en', onRegistrationError);
      await expect(emitRegistration('apns-token')).resolves.toBeUndefined();

      expect(getStoredDeviceId()).toBeNull();
      expect(getStoredToken()).toBeNull();
      expect(isPushEnabled()).toBe(false);
      expect(onRegistrationError).toHaveBeenCalled();
    });
  });

  describe('disablePush on native', () => {
    beforeEach(() => {
      setNativePlatform('ios');
    });

    it('destroys the server device, tears down the plugin, and clears storage', async () => {
      storeRegistration('device-1', 'apns-token', 'en');
      setPushEnabled(true);
      const { client, mutationSpy } = renderClient();

      await disablePush(client);

      expect(mutationSpy).toHaveGraphqlOperation('DestroyUserDevice', {
        input: { id: 'device-1' },
      });
      expect(mockPushNotifications.removeAllListeners).toHaveBeenCalled();
      expect(mockPushNotifications.unregister).toHaveBeenCalled();
      expect(getStoredDeviceId()).toBeNull();
      expect(getStoredToken()).toBeNull();
      expect(getStoredLocale()).toBeNull();
      expect(isPushEnabled()).toBe(false);
    });

    it('destroys the server device before plugin teardown', async () => {
      storeRegistration('device-1', 'apns-token', 'en');
      const { client, mutationSpy } = renderClient();

      await disablePush(client);

      expect(mutationSpy.mock.invocationCallOrder[0]).toBeLessThan(
        mockPushNotifications.unregister.mock.invocationCallOrder[0],
      );
    });

    it('still tears down the plugin and clears storage when the mutation rejects', async () => {
      storeRegistration('device-1', 'apns-token', 'en');
      setPushEnabled(true);
      const failingClient = makeFailingClient();

      await expect(disablePush(failingClient)).resolves.toBeUndefined();

      expect(mockPushNotifications.unregister).toHaveBeenCalled();
      expect(getStoredDeviceId()).toBeNull();
      expect(getStoredToken()).toBeNull();
      expect(getStoredLocale()).toBeNull();
      expect(isPushEnabled()).toBe(false);
    });

    it('skips the mutation when no device id is stored but still tears down', async () => {
      setPushEnabled(true);
      const { client, mutationSpy } = renderClient();

      await disablePush(client);

      expect(mutationSpy).not.toHaveGraphqlOperation('DestroyUserDevice');
      expect(mockPushNotifications.removeAllListeners).toHaveBeenCalled();
      expect(mockPushNotifications.unregister).toHaveBeenCalled();
      expect(isPushEnabled()).toBe(false);
    });

    it('clears storage even when the plugin teardown fails', async () => {
      storeRegistration('device-1', 'apns-token', 'en');
      setPushEnabled(true);
      mockPushNotifications.unregister.mockRejectedValueOnce(
        new Error('bridge gone'),
      );
      const { client } = renderClient();

      await expect(disablePush(client)).resolves.toBeUndefined();

      expect(getStoredDeviceId()).toBeNull();
      expect(isPushEnabled()).toBe(false);
    });
  });
});
