import { ApolloClient } from '@apollo/client';
import { gql } from 'graphql-tag';
import {
  flushCachePersistence,
  readSyncRecord,
  writeSyncRecord,
} from 'src/lib/apollo/persistence/cachePersistence';
import { addDatadogError } from 'src/lib/dataDog';
import {
  OfflineSyncDefinition,
  hashDocument,
  isSyncDue,
  runOfflineSync,
  syncRecordKey,
  syncVersion,
} from './offlineSync';

jest.mock('src/lib/apollo/persistence/cachePersistence');
jest.mock('src/lib/dataDog');

const mockRead = readSyncRecord as jest.MockedFn<typeof readSyncRecord>;
const mockWrite = writeSyncRecord as jest.MockedFn<typeof writeSyncRecord>;
const mockFlush = flushCachePersistence as jest.MockedFn<
  typeof flushCachePersistence
>;

const fragmentA = gql`
  fragment SyncFragment on Contact {
    id
  }
`;
const fragmentB = gql`
  fragment SyncFragment on Contact {
    id
    name
  }
`;
const queryWith = (fragment: typeof fragmentA) => gql`
  query SyncQuery {
    contacts {
      nodes {
        ...SyncFragment
      }
    }
  }
  ${fragment}
`;

const intervalMs = 1000;
const now = 1_000_000;
const client = {} as ApolloClient<object>;

const run = jest.fn();
const definition: OfflineSyncDefinition = {
  type: 'contacts',
  document: queryWith(fragmentA),
  intervalMs,
  run,
};

const runSync = (signal = new AbortController().signal) =>
  runOfflineSync({
    definition,
    client,
    accountListId: 'a',
    signal,
    now: () => now,
  });

const stubLocks = (request: unknown) =>
  Object.defineProperty(navigator, 'locks', {
    value: request === undefined ? undefined : { request },
    configurable: true,
  });

describe('hashDocument', () => {
  it('is stable for the same document', () => {
    expect(hashDocument(queryWith(fragmentA))).toBe(
      hashDocument(queryWith(fragmentA)),
    );
  });

  it('changes when a spread fragment changes', () => {
    expect(hashDocument(queryWith(fragmentA))).not.toBe(
      hashDocument(queryWith(fragmentB)),
    );
  });
});

describe('syncRecordKey', () => {
  it('combines type and account list id', () => {
    expect(syncRecordKey('contacts', 'a')).toBe('contacts:a');
  });
});

describe('isSyncDue', () => {
  const version = 'v1';

  it('is due without a record', () => {
    expect(isSyncDue(null, version, intervalMs, now)).toBe(true);
  });

  it('is not due inside the interval', () => {
    expect(
      isSyncDue(
        { syncedAt: now - intervalMs + 1, version },
        version,
        intervalMs,
        now,
      ),
    ).toBe(false);
  });

  it('is due at the interval', () => {
    expect(
      isSyncDue(
        { syncedAt: now - intervalMs, version },
        version,
        intervalMs,
        now,
      ),
    ).toBe(true);
  });

  it('is due when the version differs', () => {
    expect(
      isSyncDue({ syncedAt: now, version: 'old' }, version, intervalMs, now),
    ).toBe(true);
  });
});

describe('runOfflineSync', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockRead.mockResolvedValue(null);
    mockWrite.mockResolvedValue();
    mockFlush.mockResolvedValue(true);
    run.mockResolvedValue(undefined);
    stubLocks(undefined);
  });

  it('skips when not due', async () => {
    mockRead.mockResolvedValue({
      syncedAt: now,
      version: syncVersion(definition),
    });

    expect(await runSync()).toBe('skipped');
    expect(run).not.toHaveBeenCalled();
  });

  it('runs, flushes, then records', async () => {
    const order: string[] = [];
    mockFlush.mockImplementation(async () => {
      order.push('flush');
      return true;
    });
    mockWrite.mockImplementation(async () => {
      order.push('write');
    });

    expect(await runSync()).toBe('completed');
    expect(run).toHaveBeenCalledWith(
      expect.objectContaining({ client, accountListId: 'a' }),
    );
    expect(mockWrite).toHaveBeenCalledWith('contacts:a', {
      syncedAt: now,
      version: syncVersion(definition),
    });
    expect(order).toEqual(['flush', 'write']);
  });

  it('does not record when run rejects', async () => {
    run.mockRejectedValue(new Error('boom'));

    expect(await runSync()).toBe('failed');
    expect(mockWrite).not.toHaveBeenCalled();
    expect(addDatadogError).toHaveBeenCalledWith(expect.anything(), {
      mpdxErrorType: 'offline_sync',
      syncType: 'contacts',
    });
  });

  it('does not record when aborted', async () => {
    const controller = new AbortController();
    run.mockImplementation(async () => controller.abort());

    expect(await runSync(controller.signal)).toBe('aborted');
    expect(mockWrite).not.toHaveBeenCalled();
    expect(addDatadogError).not.toHaveBeenCalled();
  });

  it('does not record when flush returns false', async () => {
    mockFlush.mockResolvedValue(false);

    expect(await runSync()).toBe('failed');
    expect(mockWrite).not.toHaveBeenCalled();
  });

  it('reports a failed sync when writing the record rejects', async () => {
    mockWrite.mockRejectedValue(new Error('idb'));

    expect(await runSync()).toBe('failed');
    expect(addDatadogError).toHaveBeenCalledWith(expect.anything(), {
      mpdxErrorType: 'offline_sync',
      syncType: 'contacts',
    });
  });

  it('reports a failed sync when reading the record rejects', async () => {
    mockRead.mockRejectedValue(new Error('idb'));

    expect(await runSync()).toBe('failed');
    expect(run).not.toHaveBeenCalled();
    expect(addDatadogError).toHaveBeenCalled();
  });

  it('skips when the lock is held', async () => {
    stubLocks(jest.fn((_name, _options, callback) => callback(null)));

    expect(await runSync()).toBe('skipped');
    expect(run).not.toHaveBeenCalled();
  });

  it('takes the lock for the record key', async () => {
    const request = jest.fn((_name, _options, callback) => callback({}));
    stubLocks(request);

    expect(await runSync()).toBe('completed');
    expect(request).toHaveBeenCalledWith(
      'mpdx-offline-sync:contacts:a',
      { ifAvailable: true },
      expect.any(Function),
    );
  });

  it('re-checks the record after acquiring the lock', async () => {
    mockRead.mockResolvedValueOnce(null).mockResolvedValueOnce({
      syncedAt: now,
      version: syncVersion(definition),
    });
    stubLocks(jest.fn((_name, _options, callback) => callback({})));

    expect(await runSync()).toBe('skipped');
    expect(run).not.toHaveBeenCalled();
  });

  it('uses an in-page guard without navigator.locks', async () => {
    const results = await Promise.all([runSync(), runSync()]);

    expect([...results].sort()).toEqual(['completed', 'skipped']);
  });

  it('releases the in-page guard after finishing', async () => {
    run.mockRejectedValueOnce(new Error('boom'));

    expect(await runSync()).toBe('failed');
    expect(await runSync()).toBe('completed');
  });
});
