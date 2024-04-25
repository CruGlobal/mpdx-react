import * as Types from '../../../../src/graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type SettingsOrganizationFragment = (
  { __typename?: 'Organizations' }
  & Pick<Types.Organizations, 'id' | 'name'>
);

export type OrganizationsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type OrganizationsQuery = (
  { __typename?: 'Query' }
  & { getOrganizations: (
    { __typename?: 'AllOrganizations' }
    & { organizations: Array<Types.Maybe<(
      { __typename?: 'Organizations' }
      & Pick<Types.Organizations, 'id' | 'name'>
    )>> }
  ) }
);

export const SettingsOrganizationFragmentDoc = gql`
    fragment SettingsOrganization on Organizations {
  id
  name
}
    `;
export const OrganizationsDocument = gql`
    query Organizations {
  getOrganizations {
    organizations {
      ...SettingsOrganization
    }
  }
}
    ${SettingsOrganizationFragmentDoc}`;
export function useOrganizationsQuery(baseOptions?: Apollo.QueryHookOptions<OrganizationsQuery, OrganizationsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<OrganizationsQuery, OrganizationsQueryVariables>(OrganizationsDocument, options);
      }
export function useOrganizationsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<OrganizationsQuery, OrganizationsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<OrganizationsQuery, OrganizationsQueryVariables>(OrganizationsDocument, options);
        }
export type OrganizationsQueryHookResult = ReturnType<typeof useOrganizationsQuery>;
export type OrganizationsLazyQueryHookResult = ReturnType<typeof useOrganizationsLazyQuery>;
export type OrganizationsQueryResult = Apollo.QueryResult<OrganizationsQuery, OrganizationsQueryVariables>;