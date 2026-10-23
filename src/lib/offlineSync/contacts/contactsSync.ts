import { ContactFilterStatusEnum } from 'src/graphql/types.generated';
import { OfflineSyncDefinition } from '../offlineSync';
import {
  OfflineContactFragment,
  OfflineContactFragmentDoc,
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
  // Each page's contacts are cached as soon as it loads, so a later page can't
  // overwrite an edit made mid-sync with older data. The list stays out of the
  // cache until the last page arrives, so an interrupted re-sync can't replace a
  // complete list with a partial one.
  run: async ({ client, accountListId, signal }) => {
    const contactIds: string[] = [];
    let endCursor: string | null = null;
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
        fetchPolicy: 'no-cache',
        // Batching would give this query its own batch key, which starves the other key's batch
        context: {
          doNotBatch: true,
          suppressErrors: true,
          fetchOptions: { signal },
        },
      });
      // Batch the page's writes so watched queries are notified once per page
      client.cache.batch({
        update: (cache) => {
          data.contacts.nodes.forEach((contact) => {
            cache.writeFragment<OfflineContactFragment>({
              fragment: OfflineContactFragmentDoc,
              fragmentName: 'OfflineContact',
              data: contact,
            });
            contactIds.push(contact.id);
          });
        },
      });
      const { pageInfo } = data.contacts;
      endCursor = pageInfo.endCursor ?? null;
      after = pageInfo.hasNextPage ? (endCursor ?? undefined) : undefined;
    } while (after);

    if (signal.aborted) {
      return;
    }
    // Read the contacts back so edits made during the sync are kept, and skip
    // any that were removed from the cache since their page loaded
    const nodes = contactIds.flatMap((id) => {
      const contact = client.cache.readFragment<OfflineContactFragment>({
        id: client.cache.identify({ __typename: 'Contact', id }),
        fragment: OfflineContactFragmentDoc,
        fragmentName: 'OfflineContact',
      });
      return contact ? [contact] : [];
    });
    client.cache.writeQuery<
      OfflineContactsQuery,
      OfflineContactsQueryVariables
    >({
      query: OfflineContactsDocument,
      variables: contactsSyncVariables(accountListId),
      data: {
        contacts: {
          __typename: 'ContactConnection',
          nodes,
          pageInfo: { __typename: 'PageInfo', endCursor, hasNextPage: false },
        },
      },
    });
  },
};
