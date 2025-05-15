import { InMemoryCache } from '@apollo/client';
import { gqlMock } from '__tests__/util/graphqlMocking';
import {
  GetNotificationsDocument,
  GetNotificationsQuery,
  GetNotificationsQueryVariables,
} from 'src/components/Layouts/Primary/TopBar/Items/NotificationMenu/GetNotificationsQuery.generated';
import { createCache } from './cache';

const variables: GetNotificationsQueryVariables = {
  accountListId: 'account-list-1',
};

const readCache = (
  cache: InMemoryCache,
): GetNotificationsQuery | null | undefined =>
  cache.readQuery<GetNotificationsQuery, GetNotificationsQueryVariables>({
    query: GetNotificationsDocument,
    variables: variables,
  });

const writeCache = (
  cache: InMemoryCache,
  page: number,
  nodeCount: number,
  unreadCount: number = 0,
) => {
  const after = page === 0 ? null : page.toString();
  const endCursor = (page + 1).toString();

  // Now write page one and page four to the cache simultaneously
  cache.writeQuery<GetNotificationsQuery, GetNotificationsQueryVariables>({
    query: GetNotificationsDocument,
    variables: { ...variables, after },
    data: gqlMock<GetNotificationsQuery, GetNotificationsQueryVariables>(
      GetNotificationsDocument,
      {
        variables,
        mocks: {
          userNotifications: {
            nodes: new Array(nodeCount).fill(undefined).map(() => ({})),
            pageInfo: {
              endCursor,
              hasNextPage: true,
            },
            unreadCount,
          },
        },
      },
    ),
  });
};

describe('cache', () => {
  it('handles concurrent queries to the same page list', () => {
    const cache = createCache();

    // Prime the cache with 3 pages loaded of data
    writeCache(cache, 3, 9);

    // Now write page one and page four to the cache simultaneously
    writeCache(cache, 0, 3);
    writeCache(cache, 3, 3);

    // Check that endCursor is ready to load page 2 next
    const data = readCache(cache);
    expect(data?.userNotifications.nodes).toHaveLength(3);
    expect(data?.userNotifications.pageInfo.endCursor).toBe('1');
  });

  it('preserves extra fields', () => {
    const cache = createCache();

    // Write the same page twice but change an extra field: `unreadCount`
    writeCache(cache, 0, 3, 100);
    writeCache(cache, 0, 3, 0);

    // Ensure that the last value written wins
    expect(readCache(cache)?.userNotifications.unreadCount).toBe(0);
  });
});
