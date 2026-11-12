import { ApolloCache } from '@apollo/client';

/**
 * The Assign Coach pickers and the Add Coach search's `listed` flags both read
 * the coach list, so a change to the list must not leave either showing a
 * cached copy. Evicting the root fields makes any open picker refetch.
 */
export const evictCoachLists = (cache: ApolloCache<unknown>): void => {
  cache.evict({
    id: 'ROOT_QUERY',
    fieldName: 'newStaffCohortAssignableCoaches',
  });
  cache.evict({ id: 'ROOT_QUERY', fieldName: 'newStaffMpdCoachCandidates' });
};
