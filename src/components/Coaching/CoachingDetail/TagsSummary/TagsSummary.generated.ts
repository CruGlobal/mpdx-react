import * as Types from '../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type TagsSummaryQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  range: Types.Scalars['String']['input'];
  association: Types.ReportsTagHistoriesAssociationEnum;
}>;

export type TagsSummaryQuery = { __typename?: 'Query' } & {
  reportsTagHistories: { __typename?: 'TagHistories' } & {
    periods: Array<
      { __typename?: 'TagHistoriesPeriod' } & Pick<
        Types.TagHistoriesPeriod,
        'startDate' | 'endDate'
      > & {
          tags: Array<
            { __typename?: 'Tag' } & Pick<Types.Tag, 'id' | 'count' | 'name'>
          >;
        }
    >;
  };
};

export const TagsSummaryDocument = gql`
  query TagsSummary(
    $accountListId: ID!
    $range: String!
    $association: ReportsTagHistoriesAssociationEnum!
  ) {
    reportsTagHistories(
      accountListId: $accountListId
      range: $range
      association: $association
    ) {
      periods {
        startDate
        endDate
        tags {
          id
          count
          name
        }
      }
    }
  }
`;
export function useTagsSummaryQuery(
  baseOptions: Apollo.QueryHookOptions<
    TagsSummaryQuery,
    TagsSummaryQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<TagsSummaryQuery, TagsSummaryQueryVariables>(
    TagsSummaryDocument,
    options,
  );
}
export function useTagsSummaryLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    TagsSummaryQuery,
    TagsSummaryQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<TagsSummaryQuery, TagsSummaryQueryVariables>(
    TagsSummaryDocument,
    options,
  );
}
export type TagsSummaryQueryHookResult = ReturnType<typeof useTagsSummaryQuery>;
export type TagsSummaryLazyQueryHookResult = ReturnType<
  typeof useTagsSummaryLazyQuery
>;
export type TagsSummaryQueryResult = Apollo.QueryResult<
  TagsSummaryQuery,
  TagsSummaryQueryVariables
>;
