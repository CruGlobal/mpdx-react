import { deserialize, serialize } from 'v8';
import 'fake-indexeddb/auto';
import { IDBObjectStore, forceCloseDatabase } from 'fake-indexeddb';
import { openDB } from 'idb';
import { addDatadogError } from 'src/lib/dataDog';
import { CacheOwner, createIdbStorage } from './idbStorage';

jest.mock('src/lib/dataDog');

// jsdom does not provide structuredClone, which fake-indexeddb calls when
// storing values
if (typeof globalThis.structuredClone === 'undefined') {
  globalThis.structuredClone = <T>(value: T): T =>
    deserialize(serialize(value));
}

let dbCount = 0;
const nextDb = () => `test-${dbCount++}`;

describe('createIdbStorage', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('round-trips the cache and owner, and clear() removes both', async () => {
    const store = createIdbStorage(nextDb());
    await store.setItem('cache', '{"a":1}');
    await store.setOwner({ userId: 'user-1', version: 1 });
    expect(await store.getItem('cache')).toBe('{"a":1}');
    expect(await store.getOwner()).toEqual({ userId: 'user-1', version: 1 });
    await store.clear();
    expect(await store.getItem('cache')).toBeNull();
    expect(await store.getOwner()).toBeNull();
  });

  it('ignores writes after disable() and waits for in-progress writes', async () => {
    const store = createIdbStorage(nextDb());
    let written = false;
    const inFlight = Promise.resolve(store.setItem('cache', 'before')).then(
      () => {
        written = true;
      },
    );
    await store.disable();
    expect(written).toBe(true);
    await inFlight;
    await store.setItem('cache', 'after');
    await store.setOwner({ userId: 'user-1', version: 1 });
    expect(await store.getItem('cache')).toBe('before');
    expect(await store.getOwner()).toBeNull();
  });

  it.each([
    ['another user', { userId: 'user-2', version: 1 }],
    ['an old version', { userId: 'user-1', version: 0 }],
  ])(
    'stops writing once %s owns the store',
    async (_, otherOwner: CacheOwner) => {
      const name = nextDb();
      const store = createIdbStorage(name);
      const otherTab = createIdbStorage(name);
      store.bindOwner({ userId: 'user-1', version: 1 });
      await otherTab.setOwner(otherOwner);

      await store.setItem('cache', 'stale');
      expect(await otherTab.getItem('cache')).toBeNull();

      await otherTab.setOwner({ userId: 'user-1', version: 1 });
      await store.setItem('cache', 'later');
      expect(await otherTab.getItem('cache')).toBeNull();
    },
  );

  it('writes when the bound owner still owns the store', async () => {
    const store = createIdbStorage(nextDb());
    store.bindOwner({ userId: 'user-1', version: 1 });
    await store.setOwner({ userId: 'user-1', version: 1 });

    await store.setItem('cache', 'mine');

    expect(await store.getItem('cache')).toBe('mine');
  });

  it('round-trips a sync record when the owner matches', async () => {
    const store = createIdbStorage(nextDb());
    const owner = { userId: 'user-1', version: 1 };
    await store.setOwner(owner);
    store.bindOwner(owner);
    const record = { syncedAt: 1, version: 'v' };

    await store.setSyncRecord('contacts:a', record);

    expect(await store.getSyncRecord('contacts:a')).toEqual(record);
  });

  it('does not write a sync record without a bound owner', async () => {
    const store = createIdbStorage(nextDb());
    await store.setOwner({ userId: 'user-1', version: 1 });

    await store.setSyncRecord('contacts:a', { syncedAt: 1, version: 'v' });

    expect(await store.getSyncRecord('contacts:a')).toBeNull();
  });

  it('does not write a sync record when the stored owner differs', async () => {
    const name = nextDb();
    const store = createIdbStorage(name);
    const otherTab = createIdbStorage(name);
    store.bindOwner({ userId: 'user-1', version: 1 });
    await otherTab.setOwner({ userId: 'user-2', version: 1 });

    await store.setSyncRecord('contacts:a', { syncedAt: 1, version: 'v' });

    expect(await store.getSyncRecord('contacts:a')).toBeNull();
  });

  it('does not write a sync record after disable()', async () => {
    const store = createIdbStorage(nextDb());
    const owner = { userId: 'user-1', version: 1 };
    await store.setOwner(owner);
    store.bindOwner(owner);
    await store.disable();

    await store.setSyncRecord('contacts:a', { syncedAt: 1, version: 'v' });

    expect(await store.getSyncRecord('contacts:a')).toBeNull();
  });

  it('clear() removes sync records with the cache and owner', async () => {
    const store = createIdbStorage(nextDb());
    const owner = { userId: 'user-1', version: 1 };
    await store.setOwner(owner);
    store.bindOwner(owner);
    await store.setItem('cache', '{"a":1}');
    await store.setSyncRecord('contacts:a', { syncedAt: 1, version: 'v' });

    await store.clear();

    expect(await store.getItem('cache')).toBeNull();
    expect(await store.getOwner()).toBeNull();
    expect(await store.getSyncRecord('contacts:a')).toBeNull();
  });

  it('upgrades a version 1 database without losing the cache', async () => {
    const name = nextDb();
    const oldDb = await openDB(name, 1, {
      upgrade: (db) => {
        db.createObjectStore('apollo-cache');
      },
    });
    await oldDb.put('apollo-cache', '{"a":1}', 'cache');
    oldDb.close();

    const store = createIdbStorage(name);

    expect(await store.getItem('cache')).toBe('{"a":1}');
    expect(await store.getSyncRecord('x')).toBeNull();
  });

  it('reports whether the last write landed', async () => {
    const name = nextDb();
    const store = createIdbStorage(name);
    const otherTab = createIdbStorage(name);
    const owner = { userId: 'user-1', version: 1 };
    await store.setOwner(owner);
    store.bindOwner(owner);

    await store.setItem('cache', 'mine');
    expect(store.didLastWriteLand()).toBe(true);

    await otherTab.setOwner({ userId: 'user-2', version: 1 });
    await store.setItem('cache', 'stale');
    expect(store.didLastWriteLand()).toBe(false);
  });

  it('reports a failed write as not landed', async () => {
    jest.spyOn(IDBObjectStore.prototype, 'put').mockImplementationOnce(() => {
      throw new DOMException('full', 'QuotaExceededError');
    });
    const store = createIdbStorage(nextDb());

    await store.setItem('cache', 'x');

    expect(store.didLastWriteLand()).toBe(false);
  });

  it('reports a failed write instead of rejecting', async () => {
    const error = new DOMException('full', 'QuotaExceededError');
    jest.spyOn(IDBObjectStore.prototype, 'put').mockImplementationOnce(() => {
      throw error;
    });
    const store = createIdbStorage(nextDb());
    await expect(store.setItem('cache', 'x')).resolves.toBeUndefined();
    expect(addDatadogError).toHaveBeenCalledWith(error, {
      mpdxErrorType: 'cache_persistence',
      step: 'write',
    });
  });

  it('closes its connection when another tab needs to upgrade', async () => {
    const name = nextDb();
    const store = createIdbStorage(name);
    await store.getItem('cache');

    const upgrade = openDB(name, 3).then((db) => {
      db.close();
      return 'upgraded';
    });
    const hung = new Promise((resolve) => setTimeout(resolve, 200, 'hung'));

    expect(await Promise.race([upgrade, hung])).toBe('upgraded');
  });

  it('reopens its connection after the browser closes it', async () => {
    const openSpy = jest.spyOn(indexedDB, 'open');
    const store = createIdbStorage(nextDb());
    await store.setItem('cache', '{"a":1}');

    forceCloseDatabase(openSpy.mock.results[0].value.result);
    await new Promise((resolve) => setTimeout(resolve, 0));

    await store.clear();
    expect(await store.getItem('cache')).toBeNull();
  });

  it('rejects reads when the database cannot open', async () => {
    jest.spyOn(indexedDB, 'open').mockImplementationOnce(() => {
      throw new DOMException('blocked', 'SecurityError');
    });
    await expect(createIdbStorage(nextDb()).getItem('cache')).rejects.toThrow(
      'blocked',
    );
  });
});
