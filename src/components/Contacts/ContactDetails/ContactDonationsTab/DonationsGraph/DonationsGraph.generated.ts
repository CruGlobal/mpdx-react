import * as Types from '../../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetDonationsGraphQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  donorAccountIds?: Types.InputMaybe<
    Array<Types.Scalars['ID']['input']> | Types.Scalars['ID']['input']
  >;
}>;

export type GetDonationsGraphQuery = { __typename?: 'Query' } & {
  accountList: { __typename?: 'AccountList' } & Pick<
    Types.AccountList,
    'currency'
  >;
  reportsDonationHistories: { __typename?: 'DonationHistories' } & Pick<
    Types.DonationHistories,
    'average' | 'averageIgnoreCurrent' | 'averageIgnoreCurrentAndZero'
  > & {
      periods: Array<
        { __typename?: 'DonationHistoriesPeriod' } & Pick<
          Types.DonationHistoriesPeriod,
          'convertedTotal' | 'endDate' | 'startDate'
        > & {
            totals: Array<
              { __typename?: 'Total' } & Pick<
                Types.Total,
                'amount' | 'convertedAmount' | 'currency'
              >
            >;
          }
      >;
    };
};

export const GetDonationsGraphDocument = gql`
  query GetDonationsGraph($accountListId: ID!, $donorAccountIds: [ID!]) {
    accountList(id: $accountListId) {
      currency
    }
    reportsDonationHistories(
      accountListId: $accountListId
      donorAccountId: $donorAccountIds
      range: "24m"
    ) {
      average
      averageIgnoreCurrent
      averageIgnoreCurrentAndZero
      periods {
        totals {
          amount
          convertedAmount
          currency
        }
        convertedTotal
        endDate
        startDate
      }
    }
  }
`;
export function useGetDonationsGraphQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetDonationsGraphQuery,
    GetDonationsGraphQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetDonationsGraphQuery,
    GetDonationsGraphQueryVariables
  >(GetDonationsGraphDocument, options);
}
export function useGetDonationsGraphLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetDonationsGraphQuery,
    GetDonationsGraphQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetDonationsGraphQuery,
    GetDonationsGraphQueryVariables
  >(GetDonationsGraphDocument, options);
}
export type GetDonationsGraphQueryHookResult = ReturnType<
  typeof useGetDonationsGraphQuery
>;
export type GetDonationsGraphLazyQueryHookResult = ReturnType<
  typeof useGetDonationsGraphLazyQuery
>;
export type GetDonationsGraphQueryResult = Apollo.QueryResult<
  GetDonationsGraphQuery,
  GetDonationsGraphQueryVariables
>;
