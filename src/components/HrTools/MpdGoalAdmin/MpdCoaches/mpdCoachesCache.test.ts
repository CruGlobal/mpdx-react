import { InMemoryCache, gql } from '@apollo/client';
import { evictCoachLists } from './mpdCoachesCache';

const query = gql`
  query Coaches($cohortId: ID!) {
    newStaffCohortAssignableCoaches(cohortId: $cohortId) {
      id
    }
  }
`;

const candidatesQuery = gql`
  query Candidates($search: String!) {
    newStaffMpdCoachCandidates(search: $search) {
      id
      listed
    }
  }
`;

describe('evictCoachLists', () => {
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

    evictCoachLists(cache);

    ['cohort-1', 'cohort-2'].forEach((cohortId) =>
      expect(cache.readQuery({ query, variables: { cohortId } })).toBeNull(),
    );
  });

  // A cached search would otherwise still offer a just-added coach as pickable.
  it('drops cached candidate searches so their listed flags refresh', () => {
    const cache = new InMemoryCache();
    cache.writeQuery({
      query: candidatesQuery,
      variables: { search: 'dana' },
      data: {
        newStaffMpdCoachCandidates: [
          {
            __typename: 'NewStaffMpdCoachCandidate',
            id: 'hcm-1',
            listed: false,
          },
        ],
      },
    });

    evictCoachLists(cache);

    expect(
      cache.readQuery({
        query: candidatesQuery,
        variables: { search: 'dana' },
      }),
    ).toBeNull();
  });
});
