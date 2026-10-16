import { ApolloClient } from '@apollo/client';
import { signOut } from 'next-auth/react';
import { clearSessionData, signOutAndClear } from './clearSessionData';
import { addDatadogError, clearDatadogUser } from './dataDog';
import { CACHE_PREFIX, shouldKeepOnSignOut } from './serviceWorker/cacheNames';

jest.mock('src/lib/dataDog');

// Serwist names caches `${cacheId}-${id}-${scope}`, and src/sw/index.ts passes CACHE_PREFIX as cacheId.
const precacheName = `${CACHE_PREFIX}-precache-v2-https://mpdx.org/`;
const runtimeName = `${CACHE_PREFIX}-runtime`;

const keys = jest.fn();
const deleteCache = jest.fn();
const clearStore = jest.fn();
const client = { clearStore } as unknown as ApolloClient<unknown>;
const originalCaches = Object.getOwnPropertyDescriptor(window, 'caches');

describe('clearSessionData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearStore.mockResolvedValue([]);
    deleteCache.mockResolvedValue(true);
    Object.defineProperty(window, 'caches', {
      value: { keys, delete: deleteCache },
      configurable: true,
    });
  });

  afterEach(() => {
    if (originalCaches) {
      Object.defineProperty(window, 'caches', originalCaches);
    } else {
      Reflect.deleteProperty(window, 'caches');
    }
    window.localStorage.clear();
  });

  it('clears Datadog, localStorage, the Apollo store and non-kept caches', async () => {
    window.localStorage.setItem('apollo-cache-persist', '{}');
    keys.mockResolvedValue([precacheName, runtimeName, 'other']);
    await clearSessionData(client);
    expect(clearDatadogUser).toHaveBeenCalled();
    expect(window.localStorage.length).toBe(0);
    expect(clearStore).toHaveBeenCalled();
    expect(deleteCache.mock.calls).toEqual([[runtimeName], ['other']]);
    expect(addDatadogError).not.toHaveBeenCalled();
  });

  it('keeps going and reports each step that throws', async () => {
    window.localStorage.setItem('apollo-cache-persist', '{}');
    const clearStoreError = new Error('in flight');
    const keysError = new Error('denied');
    clearStore.mockRejectedValue(clearStoreError);
    keys.mockRejectedValue(keysError);
    await expect(clearSessionData(client)).resolves.toBeUndefined();
    expect(window.localStorage.length).toBe(0);
    expect(addDatadogError).toHaveBeenCalledWith(clearStoreError, {
      mpdxErrorType: 'clear_session_data',
      step: 'clearStore',
    });
    expect(addDatadogError).toHaveBeenCalledWith(keysError, {
      mpdxErrorType: 'clear_session_data',
      step: 'caches',
    });
  });

  it('still deletes caches when clearStore rejects', async () => {
    clearStore.mockRejectedValue(new Error('in flight'));
    keys.mockResolvedValue([runtimeName, 'other']);
    await expect(clearSessionData(client)).resolves.toBeUndefined();
    expect(deleteCache.mock.calls).toEqual([[runtimeName], ['other']]);
  });

  it('still clears localStorage and the Apollo store when clearDatadogUser throws', async () => {
    window.localStorage.setItem('apollo-cache-persist', '{}');
    keys.mockResolvedValue([]);
    (clearDatadogUser as jest.Mock).mockImplementationOnce(() => {
      throw new Error('datadog');
    });
    await expect(clearSessionData(client)).resolves.toBeUndefined();
    expect(window.localStorage.length).toBe(0);
    expect(clearStore).toHaveBeenCalled();
  });

  it('still deletes the other caches when one delete rejects', async () => {
    keys.mockResolvedValue(['first', 'second', 'third']);
    deleteCache.mockImplementationOnce(() =>
      Promise.reject(new Error('delete failed')),
    );
    await expect(clearSessionData(client)).resolves.toBeUndefined();
    expect(deleteCache.mock.calls).toEqual([['first'], ['second'], ['third']]);
  });

  it('skips Cache Storage when the browser has none', async () => {
    Reflect.deleteProperty(window, 'caches');
    await expect(clearSessionData(client)).resolves.toBeUndefined();
    expect(clearStore).toHaveBeenCalled();
  });
});

describe('signOutAndClear', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearStore.mockResolvedValue([]);
    deleteCache.mockResolvedValue(true);
    keys.mockResolvedValue([runtimeName]);
    Object.defineProperty(window, 'caches', {
      value: { keys, delete: deleteCache },
      configurable: true,
    });
  });

  afterEach(() => {
    if (originalCaches) {
      Object.defineProperty(window, 'caches', originalCaches);
    } else {
      Reflect.deleteProperty(window, 'caches');
    }
  });

  it('clears session data before signing out with the given options', async () => {
    const options = { redirect: true, callbackUrl: 'signOut' };
    await signOutAndClear(client, options);

    expect(signOut).toHaveBeenCalledWith(options);
    const signOutOrder = (signOut as jest.Mock).mock.invocationCallOrder[0];
    expect(clearStore.mock.invocationCallOrder[0]).toBeLessThan(signOutOrder);
    expect(deleteCache.mock.invocationCallOrder[0]).toBeLessThan(signOutOrder);
  });
});

describe('shouldKeepOnSignOut', () => {
  it.each([
    [precacheName, true],
    [runtimeName, false],
    ['serwist-precache-v2-https://mpdx.org/', false],
  ])('%s -> %s', (name, keep) => expect(shouldKeepOnSignOut(name)).toBe(keep));
});
