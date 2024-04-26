import * as Types from '../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ManageOrganizationsAccessQueryVariables = Types.Exact<{
  [key: string]: never;
}>;

export type ManageOrganizationsAccessQuery = { __typename?: 'Query' } & {
  user: { __typename?: 'User' } & {
    administrativeOrganizations: { __typename?: 'OrganizationConnection' } & {
      nodes: Array<
        { __typename?: 'Organization' } & Pick<Types.Organization, 'id'>
      >;
    };
  };
};

export const ManageOrganizationsAccessDocument = gql`
  query ManageOrganizationsAccess {
    user {
      administrativeOrganizations(first: 1) {
        nodes {
          id
        }
      }
    }
  }
`;
export function useManageOrganizationsAccessQuery(
  baseOptions?: Apollo.QueryHookOptions<
    ManageOrganizationsAccessQuery,
    ManageOrganizationsAccessQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    ManageOrganizationsAccessQuery,
    ManageOrganizationsAccessQueryVariables
  >(ManageOrganizationsAccessDocument, options);
}
export function useManageOrganizationsAccessLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    ManageOrganizationsAccessQuery,
    ManageOrganizationsAccessQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    ManageOrganizationsAccessQuery,
    ManageOrganizationsAccessQueryVariables
  >(ManageOrganizationsAccessDocument, options);
}
export type ManageOrganizationsAccessQueryHookResult = ReturnType<
  typeof useManageOrganizationsAccessQuery
>;
export type ManageOrganizationsAccessLazyQueryHookResult = ReturnType<
  typeof useManageOrganizationsAccessLazyQuery
>;
export type ManageOrganizationsAccessQueryResult = Apollo.QueryResult<
  ManageOrganizationsAccessQuery,
  ManageOrganizationsAccessQueryVariables
>;
