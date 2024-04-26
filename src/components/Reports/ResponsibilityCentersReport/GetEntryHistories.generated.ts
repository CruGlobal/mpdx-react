import * as Types from '../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type EntryHistoriesQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  financialAccountIds:
    | Array<Types.Scalars['ID']['input']>
    | Types.Scalars['ID']['input'];
}>;

export type EntryHistoriesQuery = { __typename?: 'Query' } & {
  entryHistories?: Types.Maybe<
    Array<
      { __typename?: 'EntryHistoriesGroup' } & Pick<
        Types.EntryHistoriesGroup,
        'financialAccountId'
      > & {
          entryHistories?: Types.Maybe<
            Array<
              { __typename?: 'EntryHistoryRest' } & Pick<
                Types.EntryHistoryRest,
                'closingBalance' | 'endDate' | 'id'
              >
            >
          >;
        }
    >
  >;
};

export const EntryHistoriesDocument = gql`
  query EntryHistories($accountListId: ID!, $financialAccountIds: [ID!]!) {
    entryHistories(
      accountListId: $accountListId
      financialAccountIds: $financialAccountIds
    ) {
      financialAccountId
      entryHistories {
        closingBalance
        endDate
        id
      }
    }
  }
`;
export function useEntryHistoriesQuery(
  baseOptions: Apollo.QueryHookOptions<
    EntryHistoriesQuery,
    EntryHistoriesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<EntryHistoriesQuery, EntryHistoriesQueryVariables>(
    EntryHistoriesDocument,
    options,
  );
}
export function useEntryHistoriesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    EntryHistoriesQuery,
    EntryHistoriesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<EntryHistoriesQuery, EntryHistoriesQueryVariables>(
    EntryHistoriesDocument,
    options,
  );
}
export type EntryHistoriesQueryHookResult = ReturnType<
  typeof useEntryHistoriesQuery
>;
export type EntryHistoriesLazyQueryHookResult = ReturnType<
  typeof useEntryHistoriesLazyQuery
>;
export type EntryHistoriesQueryResult = Apollo.QueryResult<
  EntryHistoriesQuery,
  EntryHistoriesQueryVariables
>;
