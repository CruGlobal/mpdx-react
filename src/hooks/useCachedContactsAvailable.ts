import { useEffect, useState } from 'react';
import { useIsOnline } from 'src/hooks/useIsOnline';
import { readSyncRecord } from 'src/lib/apollo/persistence/cachePersistence';
import {
  CONTACTS_SYNC_TYPE,
  contactsSync,
} from 'src/lib/offlineSync/contacts/contactsSync';
import { syncRecordKey, syncVersion } from 'src/lib/offlineSync/offlineSync';

export const useCachedContactsAvailable = (
  accountListId: string,
): boolean | undefined => {
  const isOnline = useIsOnline();
  const [read, setRead] = useState<{
    accountListId: string;
    available: boolean;
  }>();

  useEffect(() => {
    let stale = false;
    readSyncRecord(syncRecordKey(CONTACTS_SYNC_TYPE, accountListId))
      .then((record) => record?.version === syncVersion(contactsSync))
      .catch(() => false)
      .then((available) => {
        if (!stale) {
          setRead({ accountListId, available });
        }
      });
    return () => {
      stale = true;
    };
  }, [accountListId, isOnline]);

  // Keep the last answer while re-reading after a connection change so the
  // Show Cached Contacts button doesn't blink
  return read?.accountListId === accountListId ? read.available : undefined;
};
