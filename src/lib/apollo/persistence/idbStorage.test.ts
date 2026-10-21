import { deserialize, serialize } from 'v8';
import 'fake-indexeddb/auto';
import { IDBObjectStore, forceCloseDatabase } from 'fake-indexeddb';
import { openDB } from 'idb';
import { addDatadogError } from 'src/lib/dataDog';
import { createIdbStorage } from './idbStorage';

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

    const upgrade = openDB(name, 2).then((db) => {
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
