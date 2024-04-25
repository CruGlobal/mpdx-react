import * as Types from '../../src/graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetDashboardQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
}>;


export type GetDashboardQuery = (
  { __typename?: 'Query' }
  & { user: (
    { __typename?: 'User' }
    & Pick<Types.User, 'firstName'>
  ), accountList: (
    { __typename?: 'AccountList' }
    & Pick<Types.AccountList, 'id' | 'name' | 'monthlyGoal' | 'receivedPledges' | 'totalPledges' | 'currency' | 'balance'>
  ), contacts: (
    { __typename?: 'ContactConnection' }
    & Pick<Types.ContactConnection, 'totalCount'>
  ), reportsDonationHistories: (
    { __typename?: 'DonationHistories' }
    & Pick<Types.DonationHistories, 'averageIgnoreCurrent'>
    & { periods: Array<(
      { __typename?: 'DonationHistoriesPeriod' }
      & Pick<Types.DonationHistoriesPeriod, 'startDate' | 'convertedTotal'>
      & { totals: Array<(
        { __typename?: 'Total' }
        & Pick<Types.Total, 'currency' | 'convertedAmount'>
      )> }
    )> }
  ) }
);


export const GetDashboardDocument = gql`
    query GetDashboard($accountListId: ID!) {
  user {
    firstName
  }
  accountList(id: $accountListId) {
    id
    name
    monthlyGoal
    receivedPledges
    totalPledges
    currency
    balance
  }
  contacts(
    accountListId: $accountListId
    contactsFilter: {pledgeReceived: NOT_RECEIVED, status: PARTNER_FINANCIAL}
  ) {
    totalCount
  }
  reportsDonationHistories(accountListId: $accountListId) {
    averageIgnoreCurrent
    periods {
      startDate
      convertedTotal
      totals {
        currency
        convertedAmount
      }
    }
  }
}
    `;
export function useGetDashboardQuery(baseOptions: Apollo.QueryHookOptions<GetDashboardQuery, GetDashboardQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetDashboardQuery, GetDashboardQueryVariables>(GetDashboardDocument, options);
      }
export function useGetDashboardLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetDashboardQuery, GetDashboardQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetDashboardQuery, GetDashboardQueryVariables>(GetDashboardDocument, options);
        }
export type GetDashboardQueryHookResult = ReturnType<typeof useGetDashboardQuery>;
export type GetDashboardLazyQueryHookResult = ReturnType<typeof useGetDashboardLazyQuery>;
export type GetDashboardQueryResult = Apollo.QueryResult<GetDashboardQuery, GetDashboardQueryVariables>;