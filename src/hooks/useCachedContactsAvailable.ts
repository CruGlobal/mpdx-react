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
  const [available, setAvailable] = useState<boolean | undefined>();

  useEffect(() => {
    let stale = false;
    setAvailable(undefined);
    readSyncRecord(syncRecordKey(CONTACTS_SYNC_TYPE, accountListId))
      .then((record) => record?.version === syncVersion(contactsSync))
      .catch(() => false)
      .then((result) => {
        if (!stale) {
          setAvailable(result);
        }
      });
    return () => {
      stale = true;
    };
  }, [accountListId, isOnline]);

  return available;
};
