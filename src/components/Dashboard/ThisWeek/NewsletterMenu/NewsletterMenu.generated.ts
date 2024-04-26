import * as Types from '../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetTaskAnalyticsQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
}>;

export type GetTaskAnalyticsQuery = { __typename?: 'Query' } & {
  taskAnalytics: { __typename?: 'TaskAnalytics' } & Pick<
    Types.TaskAnalytics,
    'lastElectronicNewsletterCompletedAt' | 'lastPhysicalNewsletterCompletedAt'
  >;
};

export const GetTaskAnalyticsDocument = gql`
  query GetTaskAnalytics($accountListId: ID!) {
    taskAnalytics(accountListId: $accountListId) {
      lastElectronicNewsletterCompletedAt
      lastPhysicalNewsletterCompletedAt
    }
  }
`;
export function useGetTaskAnalyticsQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetTaskAnalyticsQuery,
    GetTaskAnalyticsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetTaskAnalyticsQuery, GetTaskAnalyticsQueryVariables>(
    GetTaskAnalyticsDocument,
    options,
  );
}
export function useGetTaskAnalyticsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetTaskAnalyticsQuery,
    GetTaskAnalyticsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetTaskAnalyticsQuery,
    GetTaskAnalyticsQueryVariables
  >(GetTaskAnalyticsDocument, options);
}
export type GetTaskAnalyticsQueryHookResult = ReturnType<
  typeof useGetTaskAnalyticsQuery
>;
export type GetTaskAnalyticsLazyQueryHookResult = ReturnType<
  typeof useGetTaskAnalyticsLazyQuery
>;
export type GetTaskAnalyticsQueryResult = Apollo.QueryResult<
  GetTaskAnalyticsQuery,
  GetTaskAnalyticsQueryVariables
>;
