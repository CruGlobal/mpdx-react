import * as Types from '../../../../src/graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetAppealsQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;

export type GetAppealsQuery = { __typename?: 'Query' } & {
  primaryAppeal: { __typename?: 'AppealConnection' } & {
    nodes: Array<
      { __typename?: 'Appeal' } & Pick<
        Types.Appeal,
        | 'id'
        | 'name'
        | 'amount'
        | 'amountCurrency'
        | 'pledgesAmountNotReceivedNotProcessed'
        | 'pledgesAmountReceivedNotProcessed'
        | 'pledgesAmountProcessed'
        | 'pledgesAmountTotal'
      >
    >;
  };
  regularAppeals: { __typename?: 'AppealConnection' } & {
    nodes: Array<
      { __typename?: 'Appeal' } & Pick<
        Types.Appeal,
        | 'id'
        | 'name'
        | 'amount'
        | 'amountCurrency'
        | 'pledgesAmountNotReceivedNotProcessed'
        | 'pledgesAmountReceivedNotProcessed'
        | 'pledgesAmountProcessed'
        | 'pledgesAmountTotal'
      >
    >;
    pageInfo: { __typename?: 'PageInfo' } & Pick<
      Types.PageInfo,
      'endCursor' | 'hasNextPage'
    >;
  };
};

export type AppealFieldsFragment = { __typename?: 'Appeal' } & Pick<
  Types.Appeal,
  | 'id'
  | 'name'
  | 'amount'
  | 'amountCurrency'
  | 'pledgesAmountNotReceivedNotProcessed'
  | 'pledgesAmountReceivedNotProcessed'
  | 'pledgesAmountProcessed'
  | 'pledgesAmountTotal'
>;

export const AppealFieldsFragmentDoc = gql`
  fragment AppealFields on Appeal {
    id
    name
    amount
    amountCurrency
    pledgesAmountNotReceivedNotProcessed
    pledgesAmountReceivedNotProcessed
    pledgesAmountProcessed
    pledgesAmountTotal
  }
`;
export const GetAppealsDocument = gql`
  query GetAppeals($accountListId: ID!, $after: String) {
    primaryAppeal: appeals(
      accountListId: $accountListId
      primary: true
      first: 1
    ) {
      nodes {
        ...AppealFields
      }
    }
    regularAppeals: appeals(
      accountListId: $accountListId
      primary: false
      first: 50
      after: $after
    ) {
      nodes {
        ...AppealFields
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
  ${AppealFieldsFragmentDoc}
`;
export function useGetAppealsQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetAppealsQuery,
    GetAppealsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetAppealsQuery, GetAppealsQueryVariables>(
    GetAppealsDocument,
    options,
  );
}
export function useGetAppealsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetAppealsQuery,
    GetAppealsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetAppealsQuery, GetAppealsQueryVariables>(
    GetAppealsDocument,
    options,
  );
}
export type GetAppealsQueryHookResult = ReturnType<typeof useGetAppealsQuery>;
export type GetAppealsLazyQueryHookResult = ReturnType<
  typeof useGetAppealsLazyQuery
>;
export type GetAppealsQueryResult = Apollo.QueryResult<
  GetAppealsQuery,
  GetAppealsQueryVariables
>;
