import * as Types from '../../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ContactPartnerAccountsFragment = { __typename?: 'Contact' } & Pick<
  Types.Contact,
  'id'
> & {
    contactDonorAccounts: { __typename?: 'ContactDonorAccountConnection' } & {
      nodes: Array<
        { __typename?: 'ContactDonorAccount' } & Pick<
          Types.ContactDonorAccount,
          'id'
        > & {
            donorAccount: { __typename?: 'DonorAccount' } & Pick<
              Types.DonorAccount,
              'id' | 'displayName' | 'accountNumber'
            > & {
                organization: { __typename?: 'Organization' } & Pick<
                  Types.Organization,
                  'id' | 'name'
                >;
              };
          }
      >;
    };
  };

export type GetAccountListSalaryOrganizationQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
}>;

export type GetAccountListSalaryOrganizationQuery = { __typename?: 'Query' } & {
  accountList: { __typename?: 'AccountList' } & Pick<
    Types.AccountList,
    'salaryOrganizationId'
  >;
};

export const ContactPartnerAccountsFragmentDoc = gql`
  fragment ContactPartnerAccounts on Contact {
    id
    contactDonorAccounts(first: 25) {
      nodes {
        id
        donorAccount {
          id
          displayName
          accountNumber
          organization {
            id
            name
          }
        }
      }
    }
  }
`;
export const GetAccountListSalaryOrganizationDocument = gql`
  query GetAccountListSalaryOrganization($accountListId: ID!) {
    accountList(id: $accountListId) {
      salaryOrganizationId
    }
  }
`;
export function useGetAccountListSalaryOrganizationQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetAccountListSalaryOrganizationQuery,
    GetAccountListSalaryOrganizationQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetAccountListSalaryOrganizationQuery,
    GetAccountListSalaryOrganizationQueryVariables
  >(GetAccountListSalaryOrganizationDocument, options);
}
export function useGetAccountListSalaryOrganizationLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetAccountListSalaryOrganizationQuery,
    GetAccountListSalaryOrganizationQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetAccountListSalaryOrganizationQuery,
    GetAccountListSalaryOrganizationQueryVariables
  >(GetAccountListSalaryOrganizationDocument, options);
}
export type GetAccountListSalaryOrganizationQueryHookResult = ReturnType<
  typeof useGetAccountListSalaryOrganizationQuery
>;
export type GetAccountListSalaryOrganizationLazyQueryHookResult = ReturnType<
  typeof useGetAccountListSalaryOrganizationLazyQuery
>;
export type GetAccountListSalaryOrganizationQueryResult = Apollo.QueryResult<
  GetAccountListSalaryOrganizationQuery,
  GetAccountListSalaryOrganizationQueryVariables
>;
