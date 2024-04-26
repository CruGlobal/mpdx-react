import * as Types from '../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetUserAccessQueryVariables = Types.Exact<{ [key: string]: never }>;

export type GetUserAccessQuery = { __typename?: 'Query' } & {
  user: { __typename?: 'User' } & Pick<
    Types.User,
    'id' | 'admin' | 'developer'
  >;
};

export const GetUserAccessDocument = gql`
  query GetUserAccess {
    user {
      id
      admin
      developer
    }
  }
`;
export function useGetUserAccessQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetUserAccessQuery,
    GetUserAccessQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetUserAccessQuery, GetUserAccessQueryVariables>(
    GetUserAccessDocument,
    options,
  );
}
export function useGetUserAccessLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetUserAccessQuery,
    GetUserAccessQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetUserAccessQuery, GetUserAccessQueryVariables>(
    GetUserAccessDocument,
    options,
  );
}
export type GetUserAccessQueryHookResult = ReturnType<
  typeof useGetUserAccessQuery
>;
export type GetUserAccessLazyQueryHookResult = ReturnType<
  typeof useGetUserAccessLazyQuery
>;
export type GetUserAccessQueryResult = Apollo.QueryResult<
  GetUserAccessQuery,
  GetUserAccessQueryVariables
>;
