import { InMemoryCache, gql } from '@apollo/client';
import { evictAssignableCoaches } from './mpdCoachesCache';

const query = gql`
  query Coaches($cohortId: ID!) {
    newStaffCohortAssignableCoaches(cohortId: $cohortId) {
      id
    }
  }
`;

describe('evictAssignableCoaches', () => {
  it('drops every cached coach picker list', () => {
    const cache = new InMemoryCache();
    ['cohort-1', 'cohort-2'].forEach((cohortId) =>
      cache.writeQuery({
        query,
        variables: { cohortId },
        data: {
          newStaffCohortAssignableCoaches: [
            { __typename: 'NewStaffCohortAttendeeCoach', id: 'coach-1' },
          ],
        },
      }),
    );

    evictAssignableCoaches(cache);

    ['cohort-1', 'cohort-2'].forEach((cohortId) =>
      expect(cache.readQuery({ query, variables: { cohortId } })).toBeNull(),
    );
  });
});
