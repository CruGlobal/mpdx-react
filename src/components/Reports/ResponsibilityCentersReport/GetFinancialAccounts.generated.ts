import * as Types from '../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type FinancialAccountsQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  designationAccountIds?: Types.InputMaybe<
    Array<Types.Scalars['ID']['input']> | Types.Scalars['ID']['input']
  >;
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;

export type FinancialAccountsQuery = { __typename?: 'Query' } & {
  financialAccounts: { __typename?: 'FinancialAccountConnection' } & {
    nodes: Array<
      { __typename?: 'FinancialAccount' } & Pick<
        Types.FinancialAccount,
        'active' | 'code' | 'id' | 'name' | 'updatedAt'
      > & {
          balance: { __typename?: 'Money' } & Pick<
            Types.Money,
            'conversionDate' | 'convertedAmount' | 'convertedCurrency'
          >;
          organization?: Types.Maybe<
            { __typename?: 'Organization' } & Pick<
              Types.Organization,
              'id' | 'name'
            >
          >;
        }
    >;
    pageInfo: { __typename?: 'PageInfo' } & Pick<
      Types.PageInfo,
      'endCursor' | 'hasNextPage'
    >;
  };
};

export const FinancialAccountsDocument = gql`
  query FinancialAccounts(
    $accountListId: ID!
    $designationAccountIds: [ID!]
    $after: String
  ) {
    financialAccounts(
      accountListId: $accountListId
      designationAccountId: $designationAccountIds
      after: $after
    ) {
      nodes {
        active
        balance {
          conversionDate
          convertedAmount
          convertedCurrency
        }
        code
        id
        name
        organization {
          id
          name
        }
        updatedAt
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;
export function useFinancialAccountsQuery(
  baseOptions: Apollo.QueryHookOptions<
    FinancialAccountsQuery,
    FinancialAccountsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    FinancialAccountsQuery,
    FinancialAccountsQueryVariables
  >(FinancialAccountsDocument, options);
}
export function useFinancialAccountsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    FinancialAccountsQuery,
    FinancialAccountsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    FinancialAccountsQuery,
    FinancialAccountsQueryVariables
  >(FinancialAccountsDocument, options);
}
export type FinancialAccountsQueryHookResult = ReturnType<
  typeof useFinancialAccountsQuery
>;
export type FinancialAccountsLazyQueryHookResult = ReturnType<
  typeof useFinancialAccountsLazyQuery
>;
export type FinancialAccountsQueryResult = Apollo.QueryResult<
  FinancialAccountsQuery,
  FinancialAccountsQueryVariables
>;
