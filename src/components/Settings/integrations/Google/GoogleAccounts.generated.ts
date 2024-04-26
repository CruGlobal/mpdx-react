import * as Types from '../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GoogleAccountsQueryVariables = Types.Exact<{
  [key: string]: never;
}>;

export type GoogleAccountsQuery = { __typename?: 'Query' } & {
  googleAccounts: Array<
    Types.Maybe<
      { __typename?: 'GoogleAccountAttributes' } & Pick<
        Types.GoogleAccountAttributes,
        'email' | 'primary' | 'remoteId' | 'id' | 'tokenExpired'
      >
    >
  >;
};

export type SyncGoogleAccountMutationVariables = Types.Exact<{
  input: Types.SyncGoogleAccountInput;
}>;

export type SyncGoogleAccountMutation = { __typename?: 'Mutation' } & Pick<
  Types.Mutation,
  'syncGoogleAccount'
>;

export type DeleteGoogleAccountMutationVariables = Types.Exact<{
  input: Types.DeleteGoogleAccountInput;
}>;

export type DeleteGoogleAccountMutation = { __typename?: 'Mutation' } & {
  deleteGoogleAccount: { __typename?: 'DeletionResponse' } & Pick<
    Types.DeletionResponse,
    'success'
  >;
};

export const GoogleAccountsDocument = gql`
  query GoogleAccounts {
    googleAccounts {
      email
      primary
      remoteId
      id
      tokenExpired
    }
  }
`;
export function useGoogleAccountsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GoogleAccountsQuery,
    GoogleAccountsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GoogleAccountsQuery, GoogleAccountsQueryVariables>(
    GoogleAccountsDocument,
    options,
  );
}
export function useGoogleAccountsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GoogleAccountsQuery,
    GoogleAccountsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GoogleAccountsQuery, GoogleAccountsQueryVariables>(
    GoogleAccountsDocument,
    options,
  );
}
export type GoogleAccountsQueryHookResult = ReturnType<
  typeof useGoogleAccountsQuery
>;
export type GoogleAccountsLazyQueryHookResult = ReturnType<
  typeof useGoogleAccountsLazyQuery
>;
export type GoogleAccountsQueryResult = Apollo.QueryResult<
  GoogleAccountsQuery,
  GoogleAccountsQueryVariables
>;
export const SyncGoogleAccountDocument = gql`
  mutation SyncGoogleAccount($input: SyncGoogleAccountInput!) {
    syncGoogleAccount(input: $input)
  }
`;
export type SyncGoogleAccountMutationFn = Apollo.MutationFunction<
  SyncGoogleAccountMutation,
  SyncGoogleAccountMutationVariables
>;
export function useSyncGoogleAccountMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SyncGoogleAccountMutation,
    SyncGoogleAccountMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SyncGoogleAccountMutation,
    SyncGoogleAccountMutationVariables
  >(SyncGoogleAccountDocument, options);
}
export type SyncGoogleAccountMutationHookResult = ReturnType<
  typeof useSyncGoogleAccountMutation
>;
export type SyncGoogleAccountMutationResult =
  Apollo.MutationResult<SyncGoogleAccountMutation>;
export type SyncGoogleAccountMutationOptions = Apollo.BaseMutationOptions<
  SyncGoogleAccountMutation,
  SyncGoogleAccountMutationVariables
>;
export const DeleteGoogleAccountDocument = gql`
  mutation DeleteGoogleAccount($input: DeleteGoogleAccountInput!) {
    deleteGoogleAccount(input: $input) {
      success
    }
  }
`;
export type DeleteGoogleAccountMutationFn = Apollo.MutationFunction<
  DeleteGoogleAccountMutation,
  DeleteGoogleAccountMutationVariables
>;
export function useDeleteGoogleAccountMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteGoogleAccountMutation,
    DeleteGoogleAccountMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeleteGoogleAccountMutation,
    DeleteGoogleAccountMutationVariables
  >(DeleteGoogleAccountDocument, options);
}
export type DeleteGoogleAccountMutationHookResult = ReturnType<
  typeof useDeleteGoogleAccountMutation
>;
export type DeleteGoogleAccountMutationResult =
  Apollo.MutationResult<DeleteGoogleAccountMutation>;
export type DeleteGoogleAccountMutationOptions = Apollo.BaseMutationOptions<
  DeleteGoogleAccountMutation,
  DeleteGoogleAccountMutationVariables
>;
