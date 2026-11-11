import { ApolloCache } from '@apollo/client';

/**
 * The Assign Coach pickers read the coach list, so a change to the list must
 * not leave them showing a cached copy. Evicting the root field makes any open
 * picker refetch.
 */
export const evictAssignableCoaches = (cache: ApolloCache<unknown>): void => {
  cache.evict({
    id: 'ROOT_QUERY',
    fieldName: 'newStaffCohortAssignableCoaches',
  });
};
