import React, { useEffect } from 'react';
import { ApolloClient, Operation, useApolloClient } from '@apollo/client';
import { render, waitFor } from '@testing-library/react';
import { DeepPartial } from 'ts-essentials';
import {
  emitPushNotificationActionPerformed,
  emitRegistration,
  emitRegistrationError,
  mockCapacitorCore,
  mockPushNotifications,
  setNativePlatform,
} from '__tests__/util/capacitorMocks';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { UserDevicePlatformEnum } from 'src/graphql/types.generated';
import {
  DestroyUserDeviceDocument,
  DestroyUserDeviceMutation,
  RegisterUserDeviceDocument,
  RegisterUserDeviceMutation,
} from './UserDevice.generated';
import {
  disablePush,
  enablePush,
  resetPushRegistrationStateForTesting,
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

/**
 * Kicks off `enablePush` and waits until its listeners are attached and
 * `register()` has been called, so the test can emit the OS `registration`
 * event. `enablePush` itself only resolves once registration completes, so
 * the pending promise is returned wrapped (returning it directly would let
 * `await` flatten it and deadlock).
 */
const startEnablePush = async (
  client: ApolloClient<object>,
  locale: string,
  onRegistrationError?: (error: unknown) => void,
) => {
  const enablePromise = enablePush(client, locale, onRegistrationError);
  await waitFor(() =>
    expect(mockPushNotifications.register).toHaveBeenCalled(),
  );
  return { enablePromise };
};

/** Drains pending microtasks without advancing timers. */
const flushMicrotasks = async () => {
  for (let i = 0; i < 20; i++) {
    await Promise.resolve();
  }
};

describe('pushRegistration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
    resetPushRegistrationStateForTesting();
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

      const { enablePromise } = await startEnablePush(client, 'en');
      expect(mockPushNotifications.requestPermissions).toHaveBeenCalled();
      expect(mutationSpy).not.toHaveBeenCalled();

      await emitRegistration('apns-token');
      await expect(enablePromise).resolves.toBe('granted');

      expect(mutationSpy).toHaveGraphqlOperation('RegisterUserDevice', {
        input: {
          platform: UserDevicePlatformEnum.Apns,
          token: 'apns-token',
          version: '1.0.0',
          locale: 'en',
        },
      });
    });

    it('resolves only after the registration mutation completes', async () => {
      const { client } = renderClient(registerMocks);

      const { enablePromise } = await startEnablePush(client, 'en');
      let resolved = false;
      enablePromise.then(() => {
        resolved = true;
      });

      await flushMicrotasks();
      // register() returned, but no OS token has arrived yet — the promise
      // must stay pending so callers cannot claim success prematurely
      expect(resolved).toBe(false);

      await emitRegistration('apns-token');
      await expect(enablePromise).resolves.toBe('granted');
    });

    it('rejects when no registration event arrives within the timeout', async () => {
      jest.useFakeTimers();
      try {
        const { client } = renderClient(registerMocks);

        const enablePromise = enablePush(client, 'en');
        // Attach a handler immediately so the timeout rejection is never
        // reported as unhandled before the assertion below runs
        enablePromise.catch(() => undefined);
        await flushMicrotasks();
        expect(mockPushNotifications.register).toHaveBeenCalled();

        jest.advanceTimersByTime(30_000);
        await expect(enablePromise).rejects.toThrow(/timed out/i);
      } finally {
        jest.useRealTimers();
      }
    });

    it('stores the server device id, token, and locale and sets the enabled flag', async () => {
      const { client } = renderClient(registerMocks);

      const { enablePromise } = await startEnablePush(client, 'en');
      await emitRegistration('apns-token');
      await enablePromise;

      expect(getStoredDeviceId()).toBe('device-1');
      expect(getStoredToken()).toBe('apns-token');
      expect(getStoredLocale()).toBe('en');
      expect(isPushEnabled()).toBe(true);
    });

    it('maps the frontend locale to an API-accepted locale', async () => {
      const { client, mutationSpy } = renderClient(registerMocks);

      const { enablePromise } = await startEnablePush(client, 'fr');
      await emitRegistration('apns-token');
      await enablePromise;

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

      const { enablePromise } = await startEnablePush(client, 'en');
      await emitRegistration('apns-token');
      await enablePromise;

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

      const { enablePromise } = await startEnablePush(client, 'en');
      await emitRegistration('fcm-token');
      await enablePromise;

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

  describe('listener ownership', () => {
    beforeEach(() => {
      setNativePlatform('ios');
    });

    it("never calls removeAllListeners — another consumer's push-tap listener survives registration and disable", async () => {
      // NativeDeepLinkProvider owns the pushNotificationActionPerformed
      // listener (deep-links design §4.3) — this module must not wipe it
      const foreignTapListener = jest.fn();
      await mockPushNotifications.addListener(
        'pushNotificationActionPerformed',
        foreignTapListener,
      );
      const { client } = renderClient(registerMocks);

      await startPushRegistration(client, 'en');
      await emitPushNotificationActionPerformed('tap', {
        deepLink: '/accountLists/al-1',
      });
      expect(foreignTapListener).toHaveBeenCalledTimes(1);

      await disablePush(client);
      await emitPushNotificationActionPerformed('tap', {
        deepLink: '/accountLists/al-1',
      });
      expect(foreignTapListener).toHaveBeenCalledTimes(2);

      expect(mockPushNotifications.removeAllListeners).not.toHaveBeenCalled();
    });

    it('re-running startPushRegistration replaces its own listeners instead of stacking them', async () => {
      const { client, mutationSpy } = renderClient(registerMocks);

      await startPushRegistration(client, 'en');
      await startPushRegistration(client, 'en');
      await emitRegistration('apns-token');

      expect(operationCount(mutationSpy, 'RegisterUserDevice')).toBe(1);
    });

    it('disablePush detaches the registration listeners this module attached', async () => {
      const { client, mutationSpy } = renderClient(registerMocks);
      await startPushRegistration(client, 'en');

      await disablePush(client);
      await emitRegistration('apns-token');

      expect(mutationSpy).not.toHaveGraphqlOperation('RegisterUserDevice');
    });
  });

  describe('session-scoped registration and token rotation', () => {
    beforeEach(() => {
      setNativePlatform('ios');
    });

    it('POSTs an upserting registration once per session even when localStorage matches', async () => {
      // Stale keys from a previous session (or a previous user on this
      // shell): the launch-time POST must still happen so the backend's
      // delete_conflicting_device upsert fixes ownership and recreates
      // server-deleted rows
      storeRegistration('device-1', 'apns-token', 'en');
      setPushEnabled(true);
      const { client, mutationSpy } = renderClient(registerMocks);

      await startPushRegistration(client, 'en');
      await emitRegistration('apns-token');

      expect(operationCount(mutationSpy, 'RegisterUserDevice')).toBe(1);
    });

    it('skips the network when the same token is issued again within the session', async () => {
      const { client, mutationSpy } = renderClient(registerMocks);
      const { enablePromise } = await startEnablePush(client, 'en');

      await emitRegistration('apns-token');
      await enablePromise;
      await emitRegistration('apns-token');

      expect(operationCount(mutationSpy, 'RegisterUserDevice')).toBe(1);
    });

    it('makes no further network calls when the registration flow re-runs within the session', async () => {
      const { client, mutationSpy } = renderClient(registerMocks);
      const { enablePromise } = await startEnablePush(client, 'en');
      await emitRegistration('apns-token');
      await enablePromise;
      expect(operationCount(mutationSpy, 'RegisterUserDevice')).toBe(1);

      // e.g. PushBootstrap re-runs when the user-preference locale settles
      await startPushRegistration(client, 'en');
      await emitRegistration('apns-token');

      expect(operationCount(mutationSpy, 'RegisterUserDevice')).toBe(1);
    });

    it('re-registers when the token rotates', async () => {
      const { client, mutationSpy } = renderClient(registerMocks);
      const { enablePromise } = await startEnablePush(client, 'en');
      await emitRegistration('apns-token');
      await enablePromise;

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
      const { enablePromise } = await startEnablePush(client, 'en');
      await emitRegistration('apns-token');
      await enablePromise;

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

    it('surfaces registrationError events through the callback and rejects enablePush', async () => {
      const onRegistrationError = jest.fn();
      const { client } = renderClient();

      const { enablePromise } = await startEnablePush(
        client,
        'en',
        onRegistrationError,
      );
      await emitRegistrationError('apns offline');

      await expect(enablePromise).rejects.toThrow();
      expect(onRegistrationError).toHaveBeenCalledWith({
        error: 'apns offline',
      });
    });

    it('rejects enablePush when the register mutation fails', async () => {
      const onRegistrationError = jest.fn();
      const failingClient = makeFailingClient();

      const enablePromise = enablePush(
        failingClient,
        'en',
        onRegistrationError,
      );
      await waitFor(() =>
        expect(mockPushNotifications.register).toHaveBeenCalled(),
      );
      await emitRegistration('apns-token');

      await expect(enablePromise).rejects.toThrow('offline');
      expect(onRegistrationError).toHaveBeenCalled();
      expect(isPushEnabled()).toBe(false);
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

    it('compensates with DestroyUserDevice when disable runs while a registration mutation is in flight', async () => {
      let resolveRegister: (result: {
        data: RegisterUserDeviceMutation;
      }) => void = () => undefined;
      const destroyMutate = jest.fn().mockResolvedValue({ data: {} });
      const client = {
        mutate: jest.fn((options: { mutation: unknown }) => {
          if (options.mutation === RegisterUserDeviceDocument) {
            return new Promise((resolve) => {
              resolveRegister = resolve;
            });
          }
          return destroyMutate(options);
        }),
      } as unknown as ApolloClient<object>;

      await startPushRegistration(client, 'en');
      const emitPromise = emitRegistration('apns-token');
      await waitFor(() =>
        expect(client.mutate as jest.Mock).toHaveBeenCalled(),
      );

      // The user (or logout) disables push while the register mutation is
      // still in flight — no device id is stored yet, so no DELETE fires here
      await disablePush(client);

      resolveRegister({
        data: {
          registerUserDevice: {
            id: 'device-1',
            platform: 'APNS',
            version: '1.0.0',
            locale: 'en',
          },
        },
      });
      await emitPromise;

      // The late-resolving registration must not resurrect local state…
      expect(getStoredDeviceId()).toBeNull();
      expect(getStoredToken()).toBeNull();
      expect(isPushEnabled()).toBe(false);
      // …and the server row it just created must be destroyed
      expect(destroyMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          mutation: DestroyUserDeviceDocument,
          variables: { input: { id: 'device-1' } },
        }),
      );
    });
  });
});
