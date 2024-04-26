import * as Types from '../../../graphql/types.generated';

import { gql } from '@apollo/client';
import { DonationGraphHistoriesFragmentDoc } from '../../Reports/DonationsReport/GetDonationGraph.generated';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UserContactInfoFragment = {
  __typename?: 'UserScopedToAccountList';
} & Pick<Types.UserScopedToAccountList, 'id' | 'firstName' | 'lastName'> & {
    emailAddresses: { __typename?: 'EmailAddressConnection' } & {
      nodes: Array<
        { __typename?: 'EmailAddress' } & Pick<
          Types.EmailAddress,
          'id' | 'email' | 'location' | 'primary'
        >
      >;
    };
    phoneNumbers: { __typename?: 'PhoneNumberConnection' } & {
      nodes: Array<
        { __typename?: 'PhoneNumber' } & Pick<
          Types.PhoneNumber,
          'id' | 'number' | 'location' | 'primary'
        >
      >;
    };
  };

export type LoadCoachingDetailQueryVariables = Types.Exact<{
  coachingAccountListId: Types.Scalars['ID']['input'];
}>;

export type LoadCoachingDetailQuery = { __typename?: 'Query' } & {
  coachingAccountList: { __typename?: 'CoachingAccountList' } & Pick<
    Types.CoachingAccountList,
    | 'id'
    | 'name'
    | 'currency'
    | 'monthlyGoal'
    | 'balance'
    | 'activeMpdStartAt'
    | 'activeMpdFinishAt'
    | 'activeMpdMonthlyGoal'
    | 'weeksOnMpd'
    | 'receivedPledges'
    | 'totalPledges'
  > & {
      designationAccounts: Array<
        { __typename?: 'DesignationAccount' } & Pick<
          Types.DesignationAccount,
          'id' | 'accountNumber'
        >
      >;
      primaryAppeal?: Types.Maybe<
        { __typename?: 'CoachingAppeal' } & Pick<
          Types.CoachingAppeal,
          | 'id'
          | 'name'
          | 'amount'
          | 'pledgesAmountNotReceivedNotProcessed'
          | 'pledgesAmountProcessed'
          | 'pledgesAmountReceivedNotProcessed'
        >
      >;
      coaches: { __typename?: 'UserScopedToAccountListConnection' } & {
        nodes: Array<
          { __typename?: 'UserScopedToAccountList' } & Pick<
            Types.UserScopedToAccountList,
            'id' | 'firstName' | 'lastName'
          > & {
              emailAddresses: { __typename?: 'EmailAddressConnection' } & {
                nodes: Array<
                  { __typename?: 'EmailAddress' } & Pick<
                    Types.EmailAddress,
                    'id' | 'email' | 'location' | 'primary'
                  >
                >;
              };
              phoneNumbers: { __typename?: 'PhoneNumberConnection' } & {
                nodes: Array<
                  { __typename?: 'PhoneNumber' } & Pick<
                    Types.PhoneNumber,
                    'id' | 'number' | 'location' | 'primary'
                  >
                >;
              };
            }
        >;
      };
      users: { __typename?: 'UserScopedToAccountListConnection' } & {
        nodes: Array<
          { __typename?: 'UserScopedToAccountList' } & Pick<
            Types.UserScopedToAccountList,
            'id' | 'firstName' | 'lastName'
          > & {
              emailAddresses: { __typename?: 'EmailAddressConnection' } & {
                nodes: Array<
                  { __typename?: 'EmailAddress' } & Pick<
                    Types.EmailAddress,
                    'id' | 'email' | 'location' | 'primary'
                  >
                >;
              };
              phoneNumbers: { __typename?: 'PhoneNumberConnection' } & {
                nodes: Array<
                  { __typename?: 'PhoneNumber' } & Pick<
                    Types.PhoneNumber,
                    'id' | 'number' | 'location' | 'primary'
                  >
                >;
              };
            }
        >;
      };
    };
};

export type LoadAccountListCoachingDetailQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
}>;

export type LoadAccountListCoachingDetailQuery = { __typename?: 'Query' } & {
  accountList: { __typename?: 'AccountList' } & Pick<
    Types.AccountList,
    | 'id'
    | 'name'
    | 'currency'
    | 'monthlyGoal'
    | 'balance'
    | 'activeMpdStartAt'
    | 'activeMpdFinishAt'
    | 'activeMpdMonthlyGoal'
    | 'weeksOnMpd'
    | 'receivedPledges'
    | 'totalPledges'
  > & {
      designationAccounts: Array<
        { __typename?: 'DesignationAccount' } & Pick<
          Types.DesignationAccount,
          'id' | 'accountNumber'
        >
      >;
      primaryAppeal?: Types.Maybe<
        { __typename?: 'Appeal' } & Pick<
          Types.Appeal,
          | 'id'
          | 'name'
          | 'amount'
          | 'pledgesAmountNotReceivedNotProcessed'
          | 'pledgesAmountProcessed'
          | 'pledgesAmountReceivedNotProcessed'
        >
      >;
      coaches: { __typename?: 'UserScopedToAccountListConnection' } & {
        nodes: Array<
          { __typename?: 'UserScopedToAccountList' } & Pick<
            Types.UserScopedToAccountList,
            'id' | 'firstName' | 'lastName'
          > & {
              emailAddresses: { __typename?: 'EmailAddressConnection' } & {
                nodes: Array<
                  { __typename?: 'EmailAddress' } & Pick<
                    Types.EmailAddress,
                    'id' | 'email' | 'location' | 'primary'
                  >
                >;
              };
              phoneNumbers: { __typename?: 'PhoneNumberConnection' } & {
                nodes: Array<
                  { __typename?: 'PhoneNumber' } & Pick<
                    Types.PhoneNumber,
                    'id' | 'number' | 'location' | 'primary'
                  >
                >;
              };
            }
        >;
      };
      users: { __typename?: 'UserScopedToAccountListConnection' } & {
        nodes: Array<
          { __typename?: 'UserScopedToAccountList' } & Pick<
            Types.UserScopedToAccountList,
            'id' | 'firstName' | 'lastName'
          > & {
              emailAddresses: { __typename?: 'EmailAddressConnection' } & {
                nodes: Array<
                  { __typename?: 'EmailAddress' } & Pick<
                    Types.EmailAddress,
                    'id' | 'email' | 'location' | 'primary'
                  >
                >;
              };
              phoneNumbers: { __typename?: 'PhoneNumberConnection' } & {
                nodes: Array<
                  { __typename?: 'PhoneNumber' } & Pick<
                    Types.PhoneNumber,
                    'id' | 'number' | 'location' | 'primary'
                  >
                >;
              };
            }
        >;
      };
    };
};

export type GetCoachingDonationGraphQueryVariables = Types.Exact<{
  coachingAccountListId: Types.Scalars['ID']['input'];
}>;

export type GetCoachingDonationGraphQuery = { __typename?: 'Query' } & {
  reportsDonationHistories: { __typename?: 'DonationHistories' } & Pick<
    Types.DonationHistories,
    'averageIgnoreCurrent'
  > & {
      periods: Array<
        { __typename?: 'DonationHistoriesPeriod' } & Pick<
          Types.DonationHistoriesPeriod,
          'startDate' | 'convertedTotal'
        > & {
            totals: Array<
              { __typename?: 'Total' } & Pick<
                Types.Total,
                'currency' | 'convertedAmount'
              >
            >;
          }
      >;
    };
};

export const UserContactInfoFragmentDoc = gql`
  fragment UserContactInfo on UserScopedToAccountList {
    id
    firstName
    lastName
    emailAddresses {
      nodes {
        id
        email
        location
        primary
      }
    }
    phoneNumbers {
      nodes {
        id
        number
        location
        primary
      }
    }
  }
`;
export const LoadCoachingDetailDocument = gql`
  query LoadCoachingDetail($coachingAccountListId: ID!) {
    coachingAccountList(id: $coachingAccountListId) {
      id
      name
      designationAccounts {
        id
        accountNumber
      }
      primaryAppeal {
        id
        name
        amount
        pledgesAmountNotReceivedNotProcessed
        pledgesAmountProcessed
        pledgesAmountReceivedNotProcessed
      }
      currency
      monthlyGoal
      balance
      activeMpdStartAt
      activeMpdFinishAt
      activeMpdMonthlyGoal
      weeksOnMpd
      receivedPledges
      totalPledges
      coaches {
        nodes {
          ...UserContactInfo
        }
      }
      users {
        nodes {
          ...UserContactInfo
        }
      }
    }
  }
  ${UserContactInfoFragmentDoc}
`;
export function useLoadCoachingDetailQuery(
  baseOptions: Apollo.QueryHookOptions<
    LoadCoachingDetailQuery,
    LoadCoachingDetailQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    LoadCoachingDetailQuery,
    LoadCoachingDetailQueryVariables
  >(LoadCoachingDetailDocument, options);
}
export function useLoadCoachingDetailLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    LoadCoachingDetailQuery,
    LoadCoachingDetailQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    LoadCoachingDetailQuery,
    LoadCoachingDetailQueryVariables
  >(LoadCoachingDetailDocument, options);
}
export type LoadCoachingDetailQueryHookResult = ReturnType<
  typeof useLoadCoachingDetailQuery
>;
export type LoadCoachingDetailLazyQueryHookResult = ReturnType<
  typeof useLoadCoachingDetailLazyQuery
>;
export type LoadCoachingDetailQueryResult = Apollo.QueryResult<
  LoadCoachingDetailQuery,
  LoadCoachingDetailQueryVariables
>;
export const LoadAccountListCoachingDetailDocument = gql`
  query LoadAccountListCoachingDetail($accountListId: ID!) {
    accountList(id: $accountListId) {
      id
      name
      designationAccounts {
        id
        accountNumber
      }
      primaryAppeal {
        id
        name
        amount
        pledgesAmountNotReceivedNotProcessed
        pledgesAmountProcessed
        pledgesAmountReceivedNotProcessed
      }
      currency
      monthlyGoal
      balance
      activeMpdStartAt
      activeMpdFinishAt
      activeMpdMonthlyGoal
      weeksOnMpd
      receivedPledges
      totalPledges
      coaches {
        nodes {
          ...UserContactInfo
        }
      }
      users {
        nodes {
          ...UserContactInfo
        }
      }
    }
  }
  ${UserContactInfoFragmentDoc}
`;
export function useLoadAccountListCoachingDetailQuery(
  baseOptions: Apollo.QueryHookOptions<
    LoadAccountListCoachingDetailQuery,
    LoadAccountListCoachingDetailQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    LoadAccountListCoachingDetailQuery,
    LoadAccountListCoachingDetailQueryVariables
  >(LoadAccountListCoachingDetailDocument, options);
}
export function useLoadAccountListCoachingDetailLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    LoadAccountListCoachingDetailQuery,
    LoadAccountListCoachingDetailQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    LoadAccountListCoachingDetailQuery,
    LoadAccountListCoachingDetailQueryVariables
  >(LoadAccountListCoachingDetailDocument, options);
}
export type LoadAccountListCoachingDetailQueryHookResult = ReturnType<
  typeof useLoadAccountListCoachingDetailQuery
>;
export type LoadAccountListCoachingDetailLazyQueryHookResult = ReturnType<
  typeof useLoadAccountListCoachingDetailLazyQuery
>;
export type LoadAccountListCoachingDetailQueryResult = Apollo.QueryResult<
  LoadAccountListCoachingDetailQuery,
  LoadAccountListCoachingDetailQueryVariables
>;
export const GetCoachingDonationGraphDocument = gql`
  query GetCoachingDonationGraph($coachingAccountListId: ID!) {
    reportsDonationHistories(accountListId: $coachingAccountListId) {
      ...DonationGraphHistories
    }
  }
  ${DonationGraphHistoriesFragmentDoc}
`;
export function useGetCoachingDonationGraphQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetCoachingDonationGraphQuery,
    GetCoachingDonationGraphQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetCoachingDonationGraphQuery,
    GetCoachingDonationGraphQueryVariables
  >(GetCoachingDonationGraphDocument, options);
}
export function useGetCoachingDonationGraphLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetCoachingDonationGraphQuery,
    GetCoachingDonationGraphQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetCoachingDonationGraphQuery,
    GetCoachingDonationGraphQueryVariables
  >(GetCoachingDonationGraphDocument, options);
}
export type GetCoachingDonationGraphQueryHookResult = ReturnType<
  typeof useGetCoachingDonationGraphQuery
>;
export type GetCoachingDonationGraphLazyQueryHookResult = ReturnType<
  typeof useGetCoachingDonationGraphLazyQuery
>;
export type GetCoachingDonationGraphQueryResult = Apollo.QueryResult<
  GetCoachingDonationGraphQuery,
  GetCoachingDonationGraphQueryVariables
>;
