import * as Types from '../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetReportsPledgeHistoriesQueryVariables = Types.Exact<{
  coachingId: Types.Scalars['ID']['input'];
}>;

export type GetReportsPledgeHistoriesQuery = { __typename?: 'Query' } & {
  reportPledgeHistories?: Types.Maybe<
    Array<
      Types.Maybe<
        { __typename?: 'ReportsPledgeHistories' } & Pick<
          Types.ReportsPledgeHistories,
          'id' | 'startDate' | 'endDate' | 'pledged' | 'recieved'
        >
      >
    >
  >;
};

export const GetReportsPledgeHistoriesDocument = gql`
  query GetReportsPledgeHistories($coachingId: ID!) {
    reportPledgeHistories(accountListId: $coachingId) {
      id
      startDate
      endDate
      pledged
      recieved
    }
  }
`;
export function useGetReportsPledgeHistoriesQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetReportsPledgeHistoriesQuery,
    GetReportsPledgeHistoriesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetReportsPledgeHistoriesQuery,
    GetReportsPledgeHistoriesQueryVariables
  >(GetReportsPledgeHistoriesDocument, options);
}
export function useGetReportsPledgeHistoriesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetReportsPledgeHistoriesQuery,
    GetReportsPledgeHistoriesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetReportsPledgeHistoriesQuery,
    GetReportsPledgeHistoriesQueryVariables
  >(GetReportsPledgeHistoriesDocument, options);
}
export type GetReportsPledgeHistoriesQueryHookResult = ReturnType<
  typeof useGetReportsPledgeHistoriesQuery
>;
export type GetReportsPledgeHistoriesLazyQueryHookResult = ReturnType<
  typeof useGetReportsPledgeHistoriesLazyQuery
>;
export type GetReportsPledgeHistoriesQueryResult = Apollo.QueryResult<
  GetReportsPledgeHistoriesQuery,
  GetReportsPledgeHistoriesQueryVariables
>;
