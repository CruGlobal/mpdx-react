import * as Types from '../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type DesignationAccountsQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
}>;

export type DesignationAccountsQuery = { __typename?: 'Query' } & {
  designationAccounts: Array<
    { __typename?: 'DesignationAccountsGroup' } & Pick<
      Types.DesignationAccountsGroup,
      'organizationName'
    > & {
        designationAccounts: Array<
          { __typename?: 'DesignationAccountRest' } & Pick<
            Types.DesignationAccountRest,
            | 'active'
            | 'balanceUpdatedAt'
            | 'convertedBalance'
            | 'currency'
            | 'designationNumber'
            | 'id'
            | 'name'
          >
        >;
      }
  >;
};

export const DesignationAccountsDocument = gql`
  query DesignationAccounts($accountListId: ID!) {
    designationAccounts(accountListId: $accountListId) {
      organizationName
      designationAccounts {
        active
        balanceUpdatedAt
        convertedBalance
        currency
        designationNumber
        id
        name
      }
    }
  }
`;
export function useDesignationAccountsQuery(
  baseOptions: Apollo.QueryHookOptions<
    DesignationAccountsQuery,
    DesignationAccountsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    DesignationAccountsQuery,
    DesignationAccountsQueryVariables
  >(DesignationAccountsDocument, options);
}
export function useDesignationAccountsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    DesignationAccountsQuery,
    DesignationAccountsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    DesignationAccountsQuery,
    DesignationAccountsQueryVariables
  >(DesignationAccountsDocument, options);
}
export type DesignationAccountsQueryHookResult = ReturnType<
  typeof useDesignationAccountsQuery
>;
export type DesignationAccountsLazyQueryHookResult = ReturnType<
  typeof useDesignationAccountsLazyQuery
>;
export type DesignationAccountsQueryResult = Apollo.QueryResult<
  DesignationAccountsQuery,
  DesignationAccountsQueryVariables
>;
