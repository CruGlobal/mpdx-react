import { ApolloCache, NormalizedCacheObject } from '@apollo/client';
import { CachePersistor } from 'apollo3-cache-persist';
import { addDatadogError } from 'src/lib/dataDog';
import { CACHE_KEY, PersistedCacheStore, createIdbStorage } from './idbStorage';
import { onSessionEnded } from './sessionChannel';

/** Bump when a type policy or merge function changes in a way old data would break */
export const CACHE_VERSION = 1;
export const RESTORE_TIMEOUT_MS = 3000;

const legacyStorageKey = 'apollo-cache-persist';

export interface StartCachePersistenceOptions {
  cache: ApolloCache<NormalizedCacheObject>;
  userId: string;
  impersonating: boolean;
}

const report = (error: unknown, step: string) =>
  addDatadogError(error, { mpdxErrorType: 'cache_persistence', step });

export const createCachePersistence = (
  store: PersistedCacheStore | null,
  timeoutMs = RESTORE_TIMEOUT_MS,
) => {
  let persistor: CachePersistor<NormalizedCacheObject> | undefined;
  let startPromise: Promise<void> | undefined;
  // Set once and never cleared, so nothing resumes persistence for the rest of
  // the page
  let stopped = false;
  let timedOut = false;
  const cancelled = () => stopped || timedOut;

  const pause = () => {
    stopped = true;
    persistor?.pause();
  };

  const clearStore = async (storage: PersistedCacheStore) => {
    // Wait for any write in progress so it can't land after the clear
    await storage.disable();
    await storage.clear();
  };

  // IndexedDB can hang (e.g. an upgrade blocked by another tab), which must
  // not keep sign-out from reaching signOut()
  const purge = async () => {
    if (!store) {
      return;
    }
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(
        () => reject(new Error('Apollo cache purge timed out')),
        timeoutMs,
      );
    });
    try {
      await Promise.race([clearStore(store), timeout]);
    } finally {
      clearTimeout(timer);
    }
  };

  const stop = async () => {
    pause();
    try {
      await purge();
    } catch (error) {
      report(error, 'stop');
    }
  };

  const restore = async (
    storage: PersistedCacheStore,
    { cache, userId, impersonating }: StartCachePersistenceOptions,
  ) => {
    try {
      localStorage.removeItem(legacyStorageKey);
      if (cancelled()) {
        return;
      }
      if (impersonating) {
        await stop();
        return;
      }

      persistor = new CachePersistor({
        cache,
        storage,
        maxSize: false,
        key: CACHE_KEY,
      });
      persistor.pause();

      const owner = { userId, version: CACHE_VERSION };
      const storedOwner = await storage.getOwner();
      if (
        storedOwner?.userId !== owner.userId ||
        storedOwner.version !== owner.version
      ) {
        await storage.clear();
      }

      // Read and apply the data here instead of persistor.restore() so a read
      // that finishes after the timeout never touches the live cache
      const data = await storage.getItem(CACHE_KEY);
      if (cancelled()) {
        return;
      }
      if (data) {
        cache.restore(JSON.parse(data));
      }

      storage.bindOwner(owner);
      await storage.setOwner(owner);
      if (cancelled()) {
        return;
      }
      persistor.resume();
    } catch (error) {
      report(error, 'start');
      await stop();
    }
  };

  const restoreWithTimeout = async (
    storage: PersistedCacheStore,
    options: StartCachePersistenceOptions,
  ) => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<void>((resolve) => {
      timer = setTimeout(() => {
        timedOut = true;
        report(new Error('Apollo cache restore timed out'), 'timeout');
        resolve();
      }, timeoutMs);
    });
    await Promise.race([restore(storage, options), timeout]);
    clearTimeout(timer);
  };

  const start = (options: StartCachePersistenceOptions): Promise<void> => {
    if (!startPromise && store) {
      // Subscribed here rather than in the gate, whose effects don't run until
      // the restore finishes, so a sign-out elsewhere aborts the restore
      onSessionEnded(() => void stop());
    }
    startPromise ??= store
      ? restoreWithTimeout(store, options)
      : Promise.resolve();
    return startPromise;
  };

  return { start, pause, purge, stop };
};

const appStore =
  typeof window !== 'undefined' &&
  process.env.NODE_ENV === 'production' &&
  typeof indexedDB !== 'undefined'
    ? createIdbStorage()
    : null;
const appPersistence = createCachePersistence(appStore);

export const isCachePersistenceEnabled = (): boolean => appStore !== null;
export const startCachePersistence = appPersistence.start;
export const pauseCachePersistence = appPersistence.pause;
export const purgeCachePersistence = appPersistence.purge;
export const stopCachePersistence = appPersistence.stop;
