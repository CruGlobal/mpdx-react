import { PersistentStorage } from 'apollo3-cache-persist';
import { openDB } from 'idb';
import { addDatadogError } from 'src/lib/dataDog';

const storeName = 'apollo-cache';
const ownerKey = 'owner';

export interface CacheOwner {
  userId: string;
  version: number;
}

export interface PersistedCacheStore extends PersistentStorage<string> {
  getOwner(): Promise<CacheOwner | null>;
  setOwner(owner: CacheOwner): Promise<void>;
  clear(): Promise<void>;
  disable(): Promise<void>;
}

export const createIdbStorage = (dbName = 'mpdx'): PersistedCacheStore => {
  let dbPromise: ReturnType<typeof openDatabase> | undefined;
  let disabled = false;
  const pendingWrites = new Set<Promise<unknown>>();

  const openDatabase = () =>
    openDB(dbName, 1, {
      upgrade: (db) => {
        db.createObjectStore(storeName);
      },
    });

  const getDb = () => (dbPromise ??= openDatabase());

  // Track the write synchronously so disable() sees it even before the
  // database has finished opening
  const trackWrite = (write: () => Promise<void>): Promise<void> => {
    if (disabled) {
      return Promise.resolve();
    }
    const promise = write();
    pendingWrites.add(promise);
    const remove = () => pendingWrites.delete(promise);
    promise.then(remove, remove);
    return promise;
  };

  const read = async <T>(key: string): Promise<T | null> => {
    const db = await getDb();
    return ((await db.get(storeName, key)) as T | undefined) ?? null;
  };

  return {
    getItem: (key) => read<string>(key),

    // The persistor calls this without awaiting, so failures are reported
    // instead of rejecting
    setItem: (key, value) =>
      trackWrite(async () => {
        try {
          const db = await getDb();
          await db.put(storeName, value, key);
        } catch (error) {
          addDatadogError(error, {
            mpdxErrorType: 'cache_persistence',
            step: 'write',
          });
        }
      }),

    removeItem: async (key) => {
      const db = await getDb();
      await db.delete(storeName, key);
    },

    getOwner: () => read<CacheOwner>(ownerKey),

    setOwner: (owner) =>
      trackWrite(async () => {
        const db = await getDb();
        await db.put(storeName, owner, ownerKey);
      }),

    clear: async () => {
      const db = await getDb();
      const tx = db.transaction(storeName, 'readwrite');
      await Promise.all([
        tx.store.delete('cache'),
        tx.store.delete(ownerKey),
        tx.done,
      ]);
    },

    disable: async () => {
      disabled = true;
      await Promise.allSettled(pendingWrites);
    },
  };
};
