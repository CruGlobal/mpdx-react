import * as Types from '../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetDonationGraphQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  designationAccountIds?: Types.InputMaybe<Array<Types.Scalars['ID']['input']> | Types.Scalars['ID']['input']>;
}>;


export type GetDonationGraphQuery = (
  { __typename?: 'Query' }
  & { accountList: (
    { __typename?: 'AccountList' }
    & Pick<Types.AccountList, 'id' | 'currency' | 'monthlyGoal' | 'totalPledges'>
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

export type DonationGraphHistoriesFragment = (
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
);

export const DonationGraphHistoriesFragmentDoc = gql`
    fragment DonationGraphHistories on DonationHistories {
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
    `;
export const GetDonationGraphDocument = gql`
    query GetDonationGraph($accountListId: ID!, $designationAccountIds: [ID!]) {
  accountList(id: $accountListId) {
    id
    currency
    monthlyGoal
    totalPledges
  }
  reportsDonationHistories(
    accountListId: $accountListId
    designationAccountId: $designationAccountIds
  ) {
    ...DonationGraphHistories
  }
}
    ${DonationGraphHistoriesFragmentDoc}`;
export function useGetDonationGraphQuery(baseOptions: Apollo.QueryHookOptions<GetDonationGraphQuery, GetDonationGraphQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetDonationGraphQuery, GetDonationGraphQueryVariables>(GetDonationGraphDocument, options);
      }
export function useGetDonationGraphLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetDonationGraphQuery, GetDonationGraphQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetDonationGraphQuery, GetDonationGraphQueryVariables>(GetDonationGraphDocument, options);
        }
export type GetDonationGraphQueryHookResult = ReturnType<typeof useGetDonationGraphQuery>;
export type GetDonationGraphLazyQueryHookResult = ReturnType<typeof useGetDonationGraphLazyQuery>;
export type GetDonationGraphQueryResult = Apollo.QueryResult<GetDonationGraphQuery, GetDonationGraphQueryVariables>;