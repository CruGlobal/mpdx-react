import { ApolloClient, DocumentNode } from '@apollo/client';
import { print } from 'graphql';
import {
  flushCachePersistence,
  readSyncRecord,
  writeSyncRecord,
} from 'src/lib/apollo/persistence/cachePersistence';
import { SyncRecord } from 'src/lib/apollo/persistence/idbStorage';
import { addDatadogError } from 'src/lib/dataDog';

export interface OfflineSyncDefinition {
  type: string;
  document: DocumentNode;
  intervalMs: number;
  run: (args: {
    client: ApolloClient<object>;
    accountListId: string;
    signal: AbortSignal;
  }) => Promise<void>;
}

export type OfflineSyncResult = 'skipped' | 'completed' | 'aborted' | 'failed';

// FNV-1a 32-bit
export const hashDocument = (document: DocumentNode): string => {
  let hash = 0x811c9dc5;
  for (const char of print(document)) {
    hash ^= char.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16);
};

export const syncVersion = (definition: OfflineSyncDefinition): string =>
  hashDocument(definition.document);

export const syncRecordKey = (type: string, accountListId: string): string =>
  `${type}:${accountListId}`;

export const isSyncDue = (
  record: SyncRecord | null,
  version: string,
  intervalMs: number,
  now: number,
): boolean =>
  !record || record.version !== version || now - record.syncedAt >= intervalMs;

const runningKeys = new Set<string>();

// Locks are shared across tabs. Without them, only guard against overlap within this page.
const withExclusiveKey = async (
  key: string,
  callback: () => Promise<OfflineSyncResult>,
): Promise<OfflineSyncResult> => {
  const locks = navigator.locks as LockManager | undefined;
  if (locks) {
    return locks.request(
      `mpdx-offline-sync:${key}`,
      { ifAvailable: true },
      async (lock) => (lock ? callback() : 'skipped'),
    );
  }

  if (runningKeys.has(key)) {
    return 'skipped';
  }
  runningKeys.add(key);
  try {
    return await callback();
  } finally {
    runningKeys.delete(key);
  }
};

// Apollo 3.7 never settles a query whose request was aborted, which would hold
// the lock until the page closes
const runUntilAborted = async (
  run: Promise<void>,
  signal: AbortSignal,
): Promise<void> => {
  let onAbort: (() => void) | undefined;
  const aborted = new Promise<never>((_, reject) => {
    onAbort = () => reject(new Error('Offline sync aborted'));
    // run may have aborted synchronously, before this listener existed
    if (signal.aborted) {
      onAbort();
    } else {
      signal.addEventListener('abort', onAbort, { once: true });
    }
  });
  try {
    await Promise.race([run, aborted]);
  } finally {
    if (onAbort) {
      signal.removeEventListener('abort', onAbort);
    }
  }
};

export const runOfflineSync = async ({
  definition,
  client,
  accountListId,
  signal,
  now = Date.now,
}: {
  definition: OfflineSyncDefinition;
  client: ApolloClient<object>;
  accountListId: string;
  signal: AbortSignal;
  now?: () => number;
}): Promise<OfflineSyncResult> => {
  const { type, intervalMs } = definition;
  const version = syncVersion(definition);
  const key = syncRecordKey(type, accountListId);

  const isDue = async () =>
    isSyncDue(await readSyncRecord(key), version, intervalMs, now());

  if (signal.aborted) {
    return 'aborted';
  }

  try {
    if (!(await isDue())) {
      return 'skipped';
    }

    return await withExclusiveKey(key, async () => {
      if (!(await isDue())) {
        return 'skipped';
      }

      await runUntilAborted(
        definition.run({ client, accountListId, signal }),
        signal,
      );
      if (signal.aborted) {
        return 'aborted';
      }

      if (!(await flushCachePersistence())) {
        throw new Error('Cache persistence did not save the synced data');
      }

      await writeSyncRecord(key, { syncedAt: now(), version });
      return 'completed';
    });
  } catch (error) {
    if (signal.aborted) {
      return 'aborted';
    }
    addDatadogError(error, { mpdxErrorType: 'offline_sync', syncType: type });
    return 'failed';
  }
};
