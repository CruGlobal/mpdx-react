import { ApolloClient, ApolloLink, Observable } from '@apollo/client';
import { gqlMock } from '__tests__/util/graphqlMocking';
import { GetContactDetailsHeaderDocument } from 'src/components/Contacts/ContactDetails/ContactDetailsHeader/ContactDetailsHeader.generated';
import { ContactDetailsTabDocument } from 'src/components/Contacts/ContactDetails/ContactDetailsTab/ContactDetailsTab.generated';
import { ContactDonorAccountsDocument } from 'src/components/Contacts/ContactDetails/ContactDetailsTab/PartnerAccounts/ContactPartnerAccounts.generated';
import { GetContactNotesDocument } from 'src/components/Contacts/ContactDetails/ContactNotesTab/ContactNotesTab.generated';
import { createCache } from 'src/lib/apollo/cache';
import {
  OfflineContactsDocument,
  OfflineContactsQuery,
  OfflineContactsQueryVariables,
} from './OfflineContacts.generated';
import { contactsSync, contactsSyncVariables } from './contactsSync';

const accountListId = 'a';

interface Page {
  ids: string[];
  endCursor: string | null;
  hasNextPage: boolean;
}

const makeClient = (
  pages: Array<Page | Error>,
  onRequest?: (variables: OfflineContactsQueryVariables) => void,
) => {
  const requests: OfflineContactsQueryVariables[] = [];
  const contexts: Record<string, unknown>[] = [];
  const link = new ApolloLink(
    (operation) =>
      new Observable((observer) => {
        const variables = operation.variables as OfflineContactsQueryVariables;
        requests.push(variables);
        contexts.push(operation.getContext());
        onRequest?.(variables);
        const page = pages[requests.length - 1];
        if (page instanceof Error) {
          observer.error(page);
          return;
        }
        observer.next({
          data: gqlMock<OfflineContactsQuery, OfflineContactsQueryVariables>(
            operation.query,
            {
              variables,
              mocks: {
                contacts: {
                  nodes: page.ids.map((id) => ({ id })),
                  pageInfo: {
                    endCursor: page.endCursor,
                    hasNextPage: page.hasNextPage,
                  },
                },
              },
            },
          ),
        });
        observer.complete();
      }),
  );
  const client = new ApolloClient({ cache: createCache(), link });
  return { client, requests, contexts };
};

const twoPages: Page[] = [
  { ids: ['contact-1', 'contact-2'], endCursor: 'cursor-1', hasNextPage: true },
  { ids: ['contact-3'], endCursor: 'cursor-2', hasNextPage: false },
];

const readSyncedIds = (client: ApolloClient<object>) =>
  client.cache
    .readQuery<OfflineContactsQuery, OfflineContactsQueryVariables>({
      query: OfflineContactsDocument,
      variables: contactsSyncVariables(accountListId),
    })
    ?.contacts.nodes.map(({ id }) => id);

const runSync = (
  client: ApolloClient<object>,
  signal = new AbortController().signal,
) => contactsSync.run({ client, accountListId, signal });

describe('contactsSync', () => {
  it('fetches every page', async () => {
    const { client, requests } = makeClient(twoPages);

    await runSync(client);

    expect(requests).toEqual([
      {
        accountListId,
        contactsFilters: { status: ['ACTIVE'] },
        first: 100,
      },
      {
        accountListId,
        contactsFilters: { status: ['ACTIVE'] },
        first: 100,
        after: 'cursor-1',
      },
    ]);
    expect(readSyncedIds(client)).toEqual([
      'contact-1',
      'contact-2',
      'contact-3',
    ]);
  });

  it('skips batching so its abort signal does not get its own batch key', async () => {
    const { client, contexts } = makeClient(twoPages);

    await runSync(client);

    expect(contexts).toHaveLength(2);
    contexts.forEach((context) => expect(context.doNotBatch).toBe(true));
  });

  it('suppresses error toasts because the sync reports its own errors', async () => {
    const { client, contexts } = makeClient(twoPages);

    await runSync(client);

    expect(contexts).toHaveLength(2);
    contexts.forEach((context) => expect(context.suppressErrors).toBe(true));
  });

  it('a new sync replaces the merged list', async () => {
    const { client } = makeClient([
      {
        ids: ['contact-1', 'contact-2'],
        endCursor: 'cursor-1',
        hasNextPage: false,
      },
      { ids: ['contact-3'], endCursor: 'cursor-2', hasNextPage: false },
    ]);

    await runSync(client);
    expect(readSyncedIds(client)).toEqual(['contact-1', 'contact-2']);

    await runSync(client);
    expect(readSyncedIds(client)).toEqual(['contact-3']);
  });

  describe('re-syncing over a complete list', () => {
    const resyncFirstPage: Page = {
      ids: ['contact-4'],
      endCursor: 'cursor-3',
      hasNextPage: true,
    };

    it('leaves the previous list intact when aborted between pages', async () => {
      const controller = new AbortController();
      const { client, requests } = makeClient(
        [...twoPages, resyncFirstPage],
        () => {
          if (requests.length === 3) {
            controller.abort();
          }
        },
      );

      await runSync(client);
      await runSync(client, controller.signal);

      expect(requests).toHaveLength(3);
      expect(readSyncedIds(client)).toEqual([
        'contact-1',
        'contact-2',
        'contact-3',
      ]);
    });

    it('leaves the previous list intact when a later page fails', async () => {
      const { client } = makeClient([
        ...twoPages,
        resyncFirstPage,
        new Error('network'),
      ]);

      await runSync(client);
      await expect(runSync(client)).rejects.toThrow('network');

      expect(readSyncedIds(client)).toEqual([
        'contact-1',
        'contact-2',
        'contact-3',
      ]);
    });

    it('replaces the list once every page has loaded', async () => {
      const { client } = makeClient([
        ...twoPages,
        resyncFirstPage,
        { ids: ['contact-5'], endCursor: 'cursor-4', hasNextPage: false },
      ]);

      await runSync(client);
      await runSync(client);

      expect(readSyncedIds(client)).toEqual(['contact-4', 'contact-5']);
    });
  });

  describe('contacts changed during the sync', () => {
    const contactId = (id: string) => `Contact:${id}`;

    it('keeps an edit made after its page loaded', async () => {
      const { client, requests } = makeClient(twoPages, () => {
        if (requests.length === 2) {
          client.cache.modify({
            id: contactId('contact-1'),
            fields: { notes: () => 'edited during sync' },
          });
        }
      });

      await runSync(client);

      const synced = client.cache.readQuery<
        OfflineContactsQuery,
        OfflineContactsQueryVariables
      >({
        query: OfflineContactsDocument,
        variables: contactsSyncVariables(accountListId),
      });
      expect(
        synced?.contacts.nodes.find(({ id }) => id === 'contact-1')?.notes,
      ).toBe('edited during sync');
    });

    it('leaves out a contact removed after its page loaded', async () => {
      const { client, requests } = makeClient(twoPages, () => {
        if (requests.length === 2) {
          client.cache.evict({ id: contactId('contact-1') });
        }
      });

      await runSync(client);

      expect(readSyncedIds(client)).toEqual(['contact-2', 'contact-3']);
    });

    it('caches loaded contacts even when a later page fails', async () => {
      const { client } = makeClient([twoPages[0], new Error('network')]);

      await expect(runSync(client)).rejects.toThrow('network');

      expect(
        client.cache.extract()[contactId('contact-1')],
      ).not.toBeUndefined();
      expect(readSyncedIds(client)).toBeUndefined();
    });
  });

  it('notifies watched queries once per page and once for the list', async () => {
    const { client } = makeClient(twoPages);
    const broadcastWatches = jest.spyOn(
      client.cache as unknown as { broadcastWatches: () => void },
      'broadcastWatches',
    );

    await runSync(client);

    expect(broadcastWatches).toHaveBeenCalledTimes(3);
  });

  it('stops between pages when aborted', async () => {
    const controller = new AbortController();
    const { client, requests } = makeClient(twoPages, () => controller.abort());

    await runSync(client, controller.signal);

    expect(requests).toHaveLength(1);
    expect(readSyncedIds(client)).toBeUndefined();
  });

  it('details read from synced data', async () => {
    const { client } = makeClient(twoPages);

    await runSync(client);

    const variables = { accountListId, contactId: 'contact-3' };
    expect(
      client.cache.readQuery({
        query: GetContactDetailsHeaderDocument,
        variables: { ...variables, loadDuplicate: false },
      }),
    ).not.toBeNull();
    expect(
      client.cache.readQuery({ query: ContactDetailsTabDocument, variables }),
    ).not.toBeNull();
    expect(
      client.cache.readQuery({
        query: ContactDonorAccountsDocument,
        variables,
      }),
    ).not.toBeNull();
    expect(
      client.cache.readQuery({ query: GetContactNotesDocument, variables }),
    ).not.toBeNull();
  });
});
