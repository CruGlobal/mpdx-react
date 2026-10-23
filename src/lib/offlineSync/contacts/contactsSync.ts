import { ContactFilterStatusEnum } from 'src/graphql/types.generated';
import { OfflineSyncDefinition } from '../offlineSync';
import {
  OfflineContactsDocument,
  OfflineContactsQuery,
  OfflineContactsQueryVariables,
} from './OfflineContacts.generated';

export const CONTACTS_SYNC_TYPE = 'contacts';
export const CONTACTS_SYNC_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000;
export const CONTACTS_SYNC_PAGE_SIZE = 100;

export const contactsSyncVariables = (
  accountListId: string,
): OfflineContactsQueryVariables => ({
  accountListId,
  contactsFilters: { status: [ContactFilterStatusEnum.Active] },
  first: CONTACTS_SYNC_PAGE_SIZE,
});

export const contactsSync: OfflineSyncDefinition = {
  type: CONTACTS_SYNC_TYPE,
  document: OfflineContactsDocument,
  intervalMs: CONTACTS_SYNC_INTERVAL_MS,
  run: async ({ client, accountListId, signal }) => {
    let after: string | undefined;
    do {
      if (signal.aborted) {
        return;
      }
      const { data } = await client.query<
        OfflineContactsQuery,
        OfflineContactsQueryVariables
      >({
        query: OfflineContactsDocument,
        variables: { ...contactsSyncVariables(accountListId), after },
        fetchPolicy: 'network-only',
        // Batching would give this query its own batch key, which starves the other key's batch
        context: {
          doNotBatch: true,
          suppressErrors: true,
          fetchOptions: { signal },
        },
      });
      const { endCursor, hasNextPage } = data.contacts.pageInfo;
      after = hasNextPage ? (endCursor ?? undefined) : undefined;
    } while (after);
  },
};
