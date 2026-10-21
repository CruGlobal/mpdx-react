import { deserialize, serialize } from 'v8';
import 'fake-indexeddb/auto';
import { IDBObjectStore } from 'fake-indexeddb';
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
    const inFlight = store.setItem('cache', 'before');
    await store.disable();
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

  it('rejects reads when the database cannot open', async () => {
    jest.spyOn(indexedDB, 'open').mockImplementationOnce(() => {
      throw new DOMException('blocked', 'SecurityError');
    });
    await expect(createIdbStorage(nextDb()).getItem('cache')).rejects.toThrow(
      'blocked',
    );
  });
});
