import { InMemoryCache, gql } from '@apollo/client';
import { addDatadogError } from 'src/lib/dataDog';
import { createCachePersistence } from './cachePersistence';
import { CacheOwner } from './idbStorage';
import { onSessionEnded } from './sessionChannel';

jest.mock('src/lib/dataDog');
jest.mock('./sessionChannel');

const mockOnSessionEnded = onSessionEnded as jest.MockedFn<
  typeof onSessionEnded
>;

const query = gql`
  query TestUser {
    user {
      id
      name
    }
  }
`;

const writeUser = (cache: InMemoryCache, name: string) =>
  cache.writeQuery({
    query,
    data: { user: { __typename: 'User', id: 'user-1', name } },
  });

const seedCache = new InMemoryCache();
writeUser(seedCache, 'Stored');
const storedCache = JSON.stringify(seedCache.extract());

const currentOwner: CacheOwner = { userId: 'user-1', version: 1 };

const createStore = (
  initial: { cache?: string; owner?: CacheOwner | null } = {},
) => {
  const data = new Map<string, unknown>();
  if (initial.cache !== undefined) {
    data.set('cache', initial.cache);
  }
  if (initial.owner) {
    data.set('owner', initial.owner);
  }
  return {
    getItem: jest.fn(
      async (key: string) => (data.get(key) as string | undefined) ?? null,
    ),
    setItem: jest.fn(async (key: string, value: string) => {
      data.set(key, value);
    }),
    removeItem: jest.fn(async (key: string) => {
      data.delete(key);
    }),
    getOwner: jest.fn(
      async () => (data.get('owner') as CacheOwner | undefined) ?? null,
    ),
    setOwner: jest.fn(async (owner: CacheOwner) => {
      data.set('owner', owner);
    }),
    clear: jest.fn(async () => {
      data.delete('cache');
      data.delete('owner');
    }),
    disable: jest.fn(async () => {}),
  };
};

// Runs due timers, then lets the promise chains they start settle
const advance = async (ms: number) => {
  jest.advanceTimersByTime(ms);
  for (let i = 0; i < 10; i++) {
    await Promise.resolve();
  }
};

const deferred = <T>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
};

describe('createCachePersistence', () => {
  let cache: InMemoryCache;

  beforeEach(() => {
    jest.useFakeTimers();
    cache = new InMemoryCache();
    localStorage.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('removes the legacy localStorage key on start', async () => {
    localStorage.setItem('apollo-cache-persist', '{}');
    const persistence = createCachePersistence(createStore(), 3000);

    await persistence.start({ cache, userId: 'user-1', impersonating: false });

    expect(localStorage.getItem('apollo-cache-persist')).toBeNull();
  });

  it('restores, tags the owner, then persists new writes', async () => {
    const store = createStore({ cache: storedCache, owner: currentOwner });
    const persistence = createCachePersistence(store, 3000);

    await persistence.start({ cache, userId: 'user-1', impersonating: false });

    expect(cache.extract()).toEqual(JSON.parse(storedCache));
    expect(store.setOwner).toHaveBeenCalledWith({
      userId: 'user-1',
      version: 1,
    });
    expect(store.clear).not.toHaveBeenCalled();

    writeUser(cache, 'Updated');
    await advance(1000);

    expect(store.setItem).toHaveBeenCalledWith(
      'cache',
      expect.stringContaining('Updated'),
    );
  });

  it('purges and never restores or persists while impersonating', async () => {
    const store = createStore({ cache: storedCache, owner: currentOwner });
    const persistence = createCachePersistence(store, 3000);

    await persistence.start({ cache, userId: 'user-1', impersonating: true });

    expect(store.disable).toHaveBeenCalled();
    expect(store.clear).toHaveBeenCalled();
    expect(store.getItem).not.toHaveBeenCalled();
    expect(cache.extract()).toEqual({});

    writeUser(cache, 'Impersonated');
    await advance(1000);

    expect(store.setItem).not.toHaveBeenCalled();
  });

  it.each([
    ['another user', { userId: 'user-2', version: 1 }],
    ['an old version', { userId: 'user-1', version: 0 }],
    ['no owner', null],
  ])(
    'purges a cache stored for %s before restoring',
    async (_, owner: CacheOwner | null) => {
      const store = createStore({ cache: storedCache, owner });
      const persistence = createCachePersistence(store, 3000);

      await persistence.start({
        cache,
        userId: 'user-1',
        impersonating: false,
      });

      expect(store.clear).toHaveBeenCalled();
      expect(store.clear.mock.invocationCallOrder[0]).toBeLessThan(
        store.getItem.mock.invocationCallOrder[0],
      );
      expect(cache.extract()).toEqual({});
      expect(store.setOwner).toHaveBeenCalledWith(currentOwner);
    },
  );

  it('reports, purges and resolves when the stored cache is not JSON', async () => {
    const store = createStore({ cache: 'not json', owner: currentOwner });
    const persistence = createCachePersistence(store, 3000);

    await expect(
      persistence.start({ cache, userId: 'user-1', impersonating: false }),
    ).resolves.toBeUndefined();

    expect(addDatadogError).toHaveBeenCalledWith(expect.any(SyntaxError), {
      mpdxErrorType: 'cache_persistence',
      step: 'start',
    });
    expect(store.disable).toHaveBeenCalled();
    expect(store.clear).toHaveBeenCalled();
    expect(store.setOwner).not.toHaveBeenCalled();
  });

  it('resolves and reports when the store cannot be read', async () => {
    const error = new Error('blocked');
    const store = createStore();
    store.getOwner.mockRejectedValueOnce(error);
    const setLocalItem = jest.spyOn(Storage.prototype, 'setItem');
    const persistence = createCachePersistence(store, 3000);

    await expect(
      persistence.start({ cache, userId: 'user-1', impersonating: false }),
    ).resolves.toBeUndefined();

    expect(addDatadogError).toHaveBeenCalledWith(error, {
      mpdxErrorType: 'cache_persistence',
      step: 'start',
    });
    expect(setLocalItem).not.toHaveBeenCalled();

    writeUser(cache, 'Updated');
    await advance(1000);

    expect(store.setItem).not.toHaveBeenCalled();
    expect(setLocalItem).not.toHaveBeenCalled();
  });

  it('opens after 3 seconds and leaves the live cache alone when restore finishes late', async () => {
    const store = createStore({ owner: currentOwner });
    const read = deferred<string | null>();
    store.getItem.mockReturnValueOnce(read.promise);
    const persistence = createCachePersistence(store, 3000);

    const started = persistence.start({
      cache,
      userId: 'user-1',
      impersonating: false,
    });
    await advance(2999);
    expect(store.getItem).toHaveBeenCalled();
    expect(addDatadogError).not.toHaveBeenCalled();

    await advance(1);
    await expect(started).resolves.toBeUndefined();
    expect(addDatadogError).toHaveBeenCalledWith(
      new Error('Apollo cache restore timed out'),
      { mpdxErrorType: 'cache_persistence', step: 'timeout' },
    );

    read.resolve(storedCache);
    await advance(0);

    expect(cache.extract()).toEqual({});
    expect(store.setOwner).not.toHaveBeenCalled();

    writeUser(cache, 'Updated');
    await advance(1000);

    expect(store.setItem).not.toHaveBeenCalled();
  });

  it('never resumes or tags after pause() lands mid-restore', async () => {
    const store = createStore({ owner: currentOwner });
    const read = deferred<string | null>();
    store.getItem.mockReturnValueOnce(read.promise);
    const persistence = createCachePersistence(store, 3000);

    const started = persistence.start({
      cache,
      userId: 'user-1',
      impersonating: false,
    });
    await advance(0);
    expect(store.getItem).toHaveBeenCalled();

    persistence.pause();
    read.resolve(storedCache);
    await expect(started).resolves.toBeUndefined();

    expect(cache.extract()).toEqual({});
    expect(store.setOwner).not.toHaveBeenCalled();

    writeUser(cache, 'Updated');
    await advance(1000);

    expect(store.setItem).not.toHaveBeenCalled();
  });

  it('never resumes after pause() lands while tagging the owner', async () => {
    const store = createStore({ cache: storedCache, owner: currentOwner });
    const tag = deferred<void>();
    store.setOwner.mockReturnValueOnce(tag.promise);
    const persistence = createCachePersistence(store, 3000);

    const started = persistence.start({
      cache,
      userId: 'user-1',
      impersonating: false,
    });
    await advance(0);
    expect(store.setOwner).toHaveBeenCalled();

    persistence.pause();
    tag.resolve();
    await started;

    writeUser(cache, 'Updated');
    await advance(1000);

    expect(store.setItem).not.toHaveBeenCalled();
  });

  it('stops when another tab ends the session mid-restore', async () => {
    const store = createStore({ owner: currentOwner });
    const read = deferred<string | null>();
    store.getItem.mockReturnValueOnce(read.promise);
    const persistence = createCachePersistence(store, 3000);

    const started = persistence.start({
      cache,
      userId: 'user-1',
      impersonating: false,
    });
    await advance(0);
    expect(store.getItem).toHaveBeenCalled();

    mockOnSessionEnded.mock.calls[0][0]();
    read.resolve(storedCache);
    await expect(started).resolves.toBeUndefined();

    expect(store.disable).toHaveBeenCalled();
    expect(store.clear).toHaveBeenCalled();
    expect(store.setOwner).not.toHaveBeenCalled();
    expect(cache.extract()).toEqual({});

    writeUser(cache, 'Updated');
    await advance(1000);

    expect(store.setItem).not.toHaveBeenCalled();
  });

  it('ignores start() after stop()', async () => {
    const store = createStore({ cache: storedCache, owner: currentOwner });
    const persistence = createCachePersistence(store, 3000);

    await persistence.stop();
    await persistence.start({ cache, userId: 'user-1', impersonating: false });

    expect(store.getItem).not.toHaveBeenCalled();
    expect(store.setOwner).not.toHaveBeenCalled();
    expect(cache.extract()).toEqual({});
  });

  it('purge() clears the store even when start() never ran', async () => {
    const store = createStore({ cache: storedCache, owner: currentOwner });
    const persistence = createCachePersistence(store, 3000);

    await persistence.purge();

    expect(store.disable).toHaveBeenCalled();
    expect(store.clear).toHaveBeenCalled();
    expect(store.disable.mock.invocationCallOrder[0]).toBeLessThan(
      store.clear.mock.invocationCallOrder[0],
    );
  });

  it('returns the same promise for every start() call', async () => {
    const store = createStore({ cache: storedCache, owner: currentOwner });
    const persistence = createCachePersistence(store, 3000);

    const first = persistence.start({
      cache,
      userId: 'user-1',
      impersonating: false,
    });
    const second = persistence.start({
      cache,
      userId: 'user-2',
      impersonating: true,
    });

    expect(second).toBe(first);
    await first;
    expect(store.getOwner).toHaveBeenCalledTimes(1);
    expect(mockOnSessionEnded).toHaveBeenCalledTimes(1);
  });

  it('does nothing without a store', async () => {
    const persistence = createCachePersistence(null, 3000);

    await expect(
      persistence.start({ cache, userId: 'user-1', impersonating: false }),
    ).resolves.toBeUndefined();
    expect(mockOnSessionEnded).not.toHaveBeenCalled();
    expect(() => persistence.pause()).not.toThrow();
    await expect(persistence.purge()).resolves.toBeUndefined();
    await expect(persistence.stop()).resolves.toBeUndefined();
  });
});
