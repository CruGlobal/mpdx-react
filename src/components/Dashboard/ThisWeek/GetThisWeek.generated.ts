import * as Types from '../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetThisWeekQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  endOfDay: Types.Scalars['ISO8601DateTime']['input'];
  today: Types.Scalars['ISO8601Date']['input'];
  threeWeeksFromNow: Types.Scalars['ISO8601Date']['input'];
  twoWeeksAgo: Types.Scalars['ISO8601Date']['input'];
}>;

export type GetThisWeekQuery = { __typename?: 'Query' } & {
  accountList: { __typename?: 'AccountList' } & Pick<
    Types.AccountList,
    'id'
  > & {
      primaryAppeal?: Types.Maybe<
        { __typename?: 'Appeal' } & Pick<
          Types.Appeal,
          | 'id'
          | 'name'
          | 'amount'
          | 'pledgesAmountTotal'
          | 'pledgesAmountProcessed'
          | 'amountCurrency'
        >
      >;
    };
  dueTasks: { __typename?: 'TaskConnection' } & Pick<
    Types.TaskConnection,
    'totalCount'
  > & {
      nodes: Array<
        { __typename?: 'Task' } & Pick<
          Types.Task,
          'id' | 'subject' | 'activityType' | 'startAt' | 'completedAt'
        > & {
            contacts: { __typename?: 'ContactConnection' } & Pick<
              Types.ContactConnection,
              'totalCount'
            > & {
                nodes: Array<
                  { __typename?: 'Contact' } & Pick<
                    Types.Contact,
                    'id' | 'name'
                  >
                >;
              };
          }
      >;
    };
  prayerRequestTasks: { __typename?: 'TaskConnection' } & Pick<
    Types.TaskConnection,
    'totalCount'
  > & {
      nodes: Array<
        { __typename?: 'Task' } & Pick<
          Types.Task,
          'id' | 'subject' | 'activityType' | 'startAt' | 'completedAt'
        > & {
            contacts: { __typename?: 'ContactConnection' } & {
              nodes: Array<
                { __typename?: 'Contact' } & Pick<Types.Contact, 'name'>
              >;
            };
          }
      >;
    };
  latePledgeContacts: { __typename?: 'ContactConnection' } & Pick<
    Types.ContactConnection,
    'totalCount'
  > & {
      nodes: Array<
        { __typename?: 'Contact' } & Pick<
          Types.Contact,
          'id' | 'name' | 'lateAt'
        >
      >;
    };
  reportsPeopleWithBirthdays: { __typename?: 'People' } & {
    periods: Array<
      { __typename?: 'PeoplePeriod' } & {
        people: Array<
          { __typename?: 'PersonWithParentContact' } & Pick<
            Types.PersonWithParentContact,
            'id' | 'birthdayDay' | 'birthdayMonth' | 'firstName' | 'lastName'
          > & {
              parentContact: { __typename?: 'Contact' } & Pick<
                Types.Contact,
                'id' | 'name'
              >;
            }
        >;
      }
    >;
  };
  reportsPeopleWithAnniversaries: { __typename?: 'People' } & {
    periods: Array<
      { __typename?: 'PeoplePeriod' } & {
        people: Array<
          { __typename?: 'PersonWithParentContact' } & Pick<
            Types.PersonWithParentContact,
            'id' | 'anniversaryDay' | 'anniversaryMonth'
          > & {
              parentContact: { __typename?: 'Contact' } & Pick<
                Types.Contact,
                'id' | 'name'
              >;
            }
        >;
      }
    >;
  };
  recentReferrals: { __typename?: 'ContactConnection' } & Pick<
    Types.ContactConnection,
    'totalCount'
  > & {
      nodes: Array<
        { __typename?: 'Contact' } & Pick<Types.Contact, 'id' | 'name'>
      >;
    };
  onHandReferrals: { __typename?: 'ContactConnection' } & Pick<
    Types.ContactConnection,
    'totalCount'
  > & {
      nodes: Array<
        { __typename?: 'Contact' } & Pick<Types.Contact, 'id' | 'name'>
      >;
    };
};

export const GetThisWeekDocument = gql`
  query GetThisWeek(
    $accountListId: ID!
    $endOfDay: ISO8601DateTime!
    $today: ISO8601Date!
    $threeWeeksFromNow: ISO8601Date!
    $twoWeeksAgo: ISO8601Date!
  ) {
    accountList(id: $accountListId) {
      id
      primaryAppeal {
        id
        name
        amount
        pledgesAmountTotal
        pledgesAmountProcessed
        amountCurrency
      }
    }
    dueTasks: tasks(
      accountListId: $accountListId
      first: 3
      tasksFilter: { startAt: { max: $endOfDay }, completed: false }
    ) {
      nodes {
        id
        subject
        activityType
        startAt
        completedAt
        contacts {
          nodes {
            id
            name
          }
          totalCount
        }
      }
      totalCount
    }
    prayerRequestTasks: tasks(
      accountListId: $accountListId
      first: 2
      tasksFilter: { activityType: PRAYER_REQUEST, completed: false }
    ) {
      nodes {
        id
        subject
        activityType
        startAt
        completedAt
        contacts {
          nodes {
            name
          }
        }
      }
      totalCount
    }
    latePledgeContacts: contacts(
      accountListId: $accountListId
      first: 3
      contactsFilter: {
        lateAt: { max: $today }
        status: PARTNER_FINANCIAL
        pledgeReceived: RECEIVED
      }
      sortBy: ACTIVE_STATUS_AND_NAME
    ) {
      nodes {
        id
        name
        lateAt
      }
      totalCount
    }
    reportsPeopleWithBirthdays(
      accountListId: $accountListId
      range: "4w"
      endDate: $threeWeeksFromNow
    ) {
      periods {
        people {
          id
          birthdayDay
          birthdayMonth
          firstName
          lastName
          parentContact {
            id
            name
          }
        }
      }
    }
    reportsPeopleWithAnniversaries(
      accountListId: $accountListId
      range: "4w"
      endDate: $threeWeeksFromNow
    ) {
      periods {
        people {
          id
          anniversaryDay
          anniversaryMonth
          parentContact {
            id
            name
          }
        }
      }
    }
    recentReferrals: contacts(
      accountListId: $accountListId
      first: 3
      contactsFilter: { referrer: ["any"], createdAt: { min: $twoWeeksAgo } }
      sortBy: ACTIVE_STATUS_AND_NAME
    ) {
      nodes {
        id
        name
      }
      totalCount
    }
    onHandReferrals: contacts(
      accountListId: $accountListId
      first: 3
      contactsFilter: {
        status: [
          NEVER_CONTACTED
          ASK_IN_FUTURE
          CULTIVATE_RELATIONSHIP
          CONTACT_FOR_APPOINTMENT
        ]
        referrer: ["any"]
      }
      sortBy: ACTIVE_STATUS_AND_NAME
    ) {
      nodes {
        id
        name
      }
      totalCount
    }
  }
`;
export function useGetThisWeekQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetThisWeekQuery,
    GetThisWeekQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetThisWeekQuery, GetThisWeekQueryVariables>(
    GetThisWeekDocument,
    options,
  );
}
export function useGetThisWeekLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetThisWeekQuery,
    GetThisWeekQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetThisWeekQuery, GetThisWeekQueryVariables>(
    GetThisWeekDocument,
    options,
  );
}
export type GetThisWeekQueryHookResult = ReturnType<typeof useGetThisWeekQuery>;
export type GetThisWeekLazyQueryHookResult = ReturnType<
  typeof useGetThisWeekLazyQuery
>;
export type GetThisWeekQueryResult = Apollo.QueryResult<
  GetThisWeekQuery,
  GetThisWeekQueryVariables
>;
