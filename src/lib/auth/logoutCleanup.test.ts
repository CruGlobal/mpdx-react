import { ApolloClient } from '@apollo/client';
import {
  mockCapacitorCore,
  mockPushNotifications,
  setNativePlatform,
} from '__tests__/util/capacitorMocks';
import { cachePersistor } from 'src/lib/apollo/cachePersistor';
import { clearDataDogUser } from 'src/lib/dataDog';
import {
  getStoredDeviceId,
  setPushEnabled,
  storeRegistration,
} from 'src/lib/nativeShell/pushStorage';
import { logoutCleanup } from './logoutCleanup';

jest.mock('@capacitor/core', () => mockCapacitorCore);
jest.mock('@capacitor/push-notifications', () => ({
  PushNotifications: mockPushNotifications,
}));
jest.mock('src/lib/apollo/cachePersistor', () => ({
  cachePersistor: {
    pause: jest.fn(),
    purge: jest.fn().mockResolvedValue(undefined),
  },
}));
jest.mock('src/lib/dataDog', () => ({
  clearDataDogUser: jest.fn(),
}));

const mockedPersistor = cachePersistor as unknown as {
  pause: jest.Mock;
  purge: jest.Mock;
};
const mockedClearDataDogUser = clearDataDogUser as jest.Mock;

interface ClientStub {
  client: ApolloClient<object>;
  mutate: jest.Mock;
  clearStore: jest.Mock;
}

const makeClient = (
  mutate: jest.Mock = jest
    .fn()
    .mockResolvedValue({ data: { destroyUserDevice: { success: true } } }),
): ClientStub => {
  const clearStore = jest.fn().mockResolvedValue(undefined);
  return {
    client: { mutate, clearStore } as unknown as ApolloClient<object>,
    mutate,
    clearStore,
  };
};

const cachesKeys = jest.fn();
const cachesDelete = jest.fn();

const installCaches = () => {
  cachesKeys.mockResolvedValue(['mpdx-cache-a', 'mpdx-cache-b']);
  cachesDelete.mockResolvedValue(true);
  Object.defineProperty(globalThis, 'caches', {
    value: { keys: cachesKeys, delete: cachesDelete },
    configurable: true,
    writable: true,
  });
};

const removeCaches = () => {
  delete (globalThis as { caches?: unknown }).caches;
};

const lastCall = (mock: jest.Mock): number => {
  const order = mock.mock.invocationCallOrder;
  return order[order.length - 1];
};

describe('logoutCleanup', () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockedPersistor.purge.mockResolvedValue(undefined);
    installCaches();
  });

  afterAll(() => {
    removeCaches();
  });

  describe('in the native shell', () => {
    beforeEach(() => {
      setNativePlatform('ios');
      storeRegistration('device-1', 'apns-token', 'en');
      setPushEnabled(true);
    });

    it('runs the canonical chain in order: DestroyUserDevice, CacheStorage clear, clearDataDogUser, clearApolloData', async () => {
      const { client, mutate, clearStore } = makeClient();

      await logoutCleanup(client);

      // DestroyUserDevice fired against the stored device id
      expect(mutate).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: { input: { id: 'device-1' } },
        }),
      );
      expect(cachesDelete).toHaveBeenCalledTimes(2);
      expect(mockedClearDataDogUser).toHaveBeenCalledTimes(1);
      expect(clearStore).toHaveBeenCalledTimes(1);
      expect(mockedPersistor.purge).toHaveBeenCalledTimes(1);

      // Strict ordering: the DELETE needs a valid token, so it must run
      // before any Apollo teardown; DataDog clears before the cache purge.
      expect(lastCall(mutate)).toBeLessThan(lastCall(cachesDelete));
      expect(lastCall(cachesDelete)).toBeLessThan(
        lastCall(mockedClearDataDogUser),
      );
      expect(lastCall(mockedClearDataDogUser)).toBeLessThan(
        lastCall(clearStore),
      );
      expect(lastCall(clearStore)).toBeLessThan(
        lastCall(mockedPersistor.purge),
      );
    });

    it('fires DestroyUserDevice strictly before clearStore and the persistor purge', async () => {
      const { client, mutate, clearStore } = makeClient();

      await logoutCleanup(client);

      expect(lastCall(mutate)).toBeLessThan(lastCall(clearStore));
      expect(lastCall(mutate)).toBeLessThan(lastCall(mockedPersistor.purge));
    });

    it('waits for the DestroyUserDevice mutation to complete before any CacheStorage or Apollo teardown', async () => {
      // Completion-order guard: invocation order alone would still pass if an
      // await were dropped, letting the DELETE race the Apollo teardown
      let resolveMutate!: (value: unknown) => void;
      const mutate = jest.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveMutate = resolve;
          }),
      );
      const { client, clearStore } = makeClient(mutate);

      const cleanup = logoutCleanup(client);
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mutate).toHaveBeenCalledTimes(1);
      expect(cachesDelete).not.toHaveBeenCalled();
      expect(mockedClearDataDogUser).not.toHaveBeenCalled();
      expect(clearStore).not.toHaveBeenCalled();
      expect(mockedPersistor.purge).not.toHaveBeenCalled();

      resolveMutate({ data: { destroyUserDevice: { success: true } } });
      await cleanup;

      expect(cachesDelete).toHaveBeenCalledTimes(2);
      expect(mockedClearDataDogUser).toHaveBeenCalledTimes(1);
      expect(clearStore).toHaveBeenCalledTimes(1);
      expect(mockedPersistor.purge).toHaveBeenCalledTimes(1);
    });

    it('still clears Apollo data and resolves when the DestroyUserDevice mutation rejects', async () => {
      const { client, clearStore } = makeClient(
        jest.fn().mockRejectedValue(new Error('401 token already dead')),
      );

      await expect(logoutCleanup(client)).resolves.toBeUndefined();

      // The device still stops receiving and local push state is cleared
      expect(mockPushNotifications.unregister).toHaveBeenCalled();
      expect(getStoredDeviceId()).toBeNull();
      expect(mockedClearDataDogUser).toHaveBeenCalledTimes(1);
      expect(clearStore).toHaveBeenCalledTimes(1);
      expect(mockedPersistor.purge).toHaveBeenCalledTimes(1);
    });
  });

  describe('on the web', () => {
    beforeEach(() => {
      setNativePlatform('web');
    });

    it('never touches the push plugin or the network but still clears CacheStorage, DataDog, and Apollo data', async () => {
      const { client, mutate, clearStore } = makeClient();

      await logoutCleanup(client);

      expect(mutate).not.toHaveBeenCalled();
      expect(mockPushNotifications.removeAllListeners).not.toHaveBeenCalled();
      expect(mockPushNotifications.unregister).not.toHaveBeenCalled();

      expect(cachesDelete).toHaveBeenCalledWith('mpdx-cache-a');
      expect(cachesDelete).toHaveBeenCalledWith('mpdx-cache-b');
      expect(mockedClearDataDogUser).toHaveBeenCalledTimes(1);
      expect(clearStore).toHaveBeenCalledTimes(1);
      expect(mockedPersistor.purge).toHaveBeenCalledTimes(1);
    });

    it('resolves and clears Apollo data when CacheStorage is unavailable', async () => {
      removeCaches();
      const { client, clearStore } = makeClient();

      await expect(logoutCleanup(client)).resolves.toBeUndefined();

      expect(mockedClearDataDogUser).toHaveBeenCalledTimes(1);
      expect(clearStore).toHaveBeenCalledTimes(1);
      expect(mockedPersistor.purge).toHaveBeenCalledTimes(1);
    });

    it('still clears DataDog and Apollo data and resolves when caches.delete rejects', async () => {
      cachesDelete.mockRejectedValue(new Error('cache delete denied'));
      const { client, clearStore } = makeClient();

      await expect(logoutCleanup(client)).resolves.toBeUndefined();

      expect(mockedClearDataDogUser).toHaveBeenCalledTimes(1);
      expect(clearStore).toHaveBeenCalledTimes(1);
      expect(mockedPersistor.purge).toHaveBeenCalledTimes(1);
    });

    it('still clears DataDog and Apollo data and resolves when caches.keys throws', async () => {
      cachesKeys.mockRejectedValue(
        new DOMException('access denied', 'SecurityError'),
      );
      const { client, clearStore } = makeClient();

      await expect(logoutCleanup(client)).resolves.toBeUndefined();

      expect(cachesDelete).not.toHaveBeenCalled();
      expect(mockedClearDataDogUser).toHaveBeenCalledTimes(1);
      expect(clearStore).toHaveBeenCalledTimes(1);
      expect(mockedPersistor.purge).toHaveBeenCalledTimes(1);
    });
  });
});
