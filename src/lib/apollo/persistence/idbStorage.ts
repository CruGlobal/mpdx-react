import { PersistentStorage } from 'apollo3-cache-persist';
import { openDB } from 'idb';
import { addDatadogError } from 'src/lib/dataDog';

export const CACHE_KEY = 'cache';

const storeName = 'apollo-cache';
const syncStoreName = 'offline-sync';
const ownerKey = 'owner';

export interface CacheOwner {
  userId: string;
  version: number;
}

export interface SyncRecord {
  syncedAt: number;
  version: string;
}

export interface PersistedCacheStore extends PersistentStorage<string> {
  getOwner(): Promise<CacheOwner | null>;
  setOwner(owner: CacheOwner): Promise<void>;
  getSyncRecord(key: string): Promise<SyncRecord | null>;
  /** Like cache writes, but skipped when no owner is bound */
  setSyncRecord(key: string, record: SyncRecord): Promise<void>;
  /**
   * Only write the cache while the stored owner matches this one. On a
   * mismatch (another user signed in from another tab) writes stop for good.
   */
  bindOwner(owner: CacheOwner): void;
  /**
   * Whether the most recent setItem actually stored its value. setItem itself
   * resolves either way.
   */
  didLastWriteLand(): boolean;
  clear(): Promise<void>;
  disable(): Promise<void>;
}

export const createIdbStorage = (dbName = 'mpdx'): PersistedCacheStore => {
  let dbPromise: ReturnType<typeof openDatabase> | undefined;
  let disabled = false;
  let boundOwner: CacheOwner | undefined;
  let lastWriteLanded = false;
  const pendingWrites = new Set<Promise<unknown>>();

  const openDatabase = () =>
    openDB(dbName, 2, {
      upgrade: (db, oldVersion) => {
        if (oldVersion < 1) {
          db.createObjectStore(storeName);
        }
        if (oldVersion < 2) {
          db.createObjectStore(syncStoreName);
        }
      },
      // Otherwise another tab's upgrade waits on this connection forever
      blocking: (_currentVersion, _blockedVersion, event) => {
        (event.target as IDBDatabase).close();
        dbPromise = undefined;
      },
      terminated: () => {
        dbPromise = undefined;
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

  const disable = async () => {
    disabled = true;
    await Promise.allSettled(pendingWrites);
  };

  // Resolves to whether the value was actually stored
  const write = async (key: string, value: string): Promise<boolean> => {
    const db = await getDb();
    if (!boundOwner) {
      await db.put(storeName, value, key);
      return true;
    }
    const owner = boundOwner;
    const tx = db.transaction(storeName, 'readwrite');
    const stored = (await tx.store.get(ownerKey)) as CacheOwner | undefined;
    let landed = false;
    if (stored?.userId === owner.userId && stored.version === owner.version) {
      await tx.store.put(value, key);
      landed = true;
    } else {
      // Not awaited: disable() waits for pending writes, including this one
      void disable();
    }
    await tx.done;
    return landed;
  };

  const writeSyncRecord = async (key: string, record: SyncRecord) => {
    if (!boundOwner) {
      return;
    }
    const owner = boundOwner;
    const db = await getDb();
    const tx = db.transaction([storeName, syncStoreName], 'readwrite');
    const stored = (await tx.objectStore(storeName).get(ownerKey)) as
      | CacheOwner
      | undefined;
    if (stored?.userId === owner.userId && stored.version === owner.version) {
      await tx.objectStore(syncStoreName).put(record, key);
    } else {
      void disable();
    }
    await tx.done;
  };

  return {
    getItem: (key) => read<string>(key),

    getSyncRecord: async (key) => {
      const db = await getDb();
      return (
        ((await db.get(syncStoreName, key)) as SyncRecord | undefined) ?? null
      );
    },

    setSyncRecord: (key, record) =>
      trackWrite(() => writeSyncRecord(key, record)),

    // The persistor calls this without awaiting, so failures are reported
    // instead of rejecting
    setItem: (key, value) => {
      lastWriteLanded = false;
      return trackWrite(async () => {
        try {
          lastWriteLanded = await write(key, value);
        } catch (error) {
          addDatadogError(error, {
            mpdxErrorType: 'cache_persistence',
            step: 'write',
          });
        }
      });
    },

    didLastWriteLand: () => lastWriteLanded,

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

    bindOwner: (owner) => {
      boundOwner = owner;
    },

    clear: async () => {
      const db = await getDb();
      const tx = db.transaction([storeName, syncStoreName], 'readwrite');
      const cacheStore = tx.objectStore(storeName);
      await Promise.all([
        cacheStore.delete(CACHE_KEY),
        cacheStore.delete(ownerKey),
        tx.objectStore(syncStoreName).clear(),
        tx.done,
      ]);
    },

    disable,
  };
};
