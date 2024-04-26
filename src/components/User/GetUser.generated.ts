import * as Types from '../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetUserQueryVariables = Types.Exact<{ [key: string]: never }>;

export type GetUserQuery = { __typename?: 'Query' } & {
  user: { __typename?: 'User' } & Pick<
    Types.User,
    'id' | 'firstName' | 'lastName' | 'admin' | 'developer'
  > & {
      keyAccounts: Array<
        { __typename?: 'KeyAccount' } & Pick<Types.KeyAccount, 'id' | 'email'>
      >;
      preferences?: Types.Maybe<
        { __typename?: 'Preference' } & {
          language: Types.Preference['locale'];
          locale: Types.Preference['localeDisplay'];
        }
      >;
      administrativeOrganizations: { __typename?: 'OrganizationConnection' } & {
        nodes: Array<
          { __typename?: 'Organization' } & Pick<Types.Organization, 'id'>
        >;
      };
    };
};

export const GetUserDocument = gql`
  query GetUser {
    user {
      id
      firstName
      lastName
      admin
      developer
      keyAccounts {
        id
        email
      }
      preferences {
        language: locale
        locale: localeDisplay
      }
      administrativeOrganizations(first: 25) {
        nodes {
          id
        }
      }
    }
  }
`;
export function useGetUserQuery(
  baseOptions?: Apollo.QueryHookOptions<GetUserQuery, GetUserQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetUserQuery, GetUserQueryVariables>(
    GetUserDocument,
    options,
  );
}
export function useGetUserLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetUserQuery,
    GetUserQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetUserQuery, GetUserQueryVariables>(
    GetUserDocument,
    options,
  );
}
export type GetUserQueryHookResult = ReturnType<typeof useGetUserQuery>;
export type GetUserLazyQueryHookResult = ReturnType<typeof useGetUserLazyQuery>;
export type GetUserQueryResult = Apollo.QueryResult<
  GetUserQuery,
  GetUserQueryVariables
>;
