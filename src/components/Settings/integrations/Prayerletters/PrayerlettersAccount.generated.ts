import * as Types from '../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type PrayerlettersAccountQueryVariables = Types.Exact<{
  input: Types.PrayerlettersAccountInput;
}>;


export type PrayerlettersAccountQuery = (
  { __typename?: 'Query' }
  & { prayerlettersAccount?: Types.Maybe<Array<Types.Maybe<(
    { __typename?: 'PrayerlettersAccount' }
    & Pick<Types.PrayerlettersAccount, 'validToken'>
  )>>> }
);

export type SyncPrayerlettersAccountMutationVariables = Types.Exact<{
  input: Types.SyncPrayerlettersAccountInput;
}>;


export type SyncPrayerlettersAccountMutation = (
  { __typename?: 'Mutation' }
  & Pick<Types.Mutation, 'syncPrayerlettersAccount'>
);

export type DeletePrayerlettersAccountMutationVariables = Types.Exact<{
  input: Types.DeletePrayerlettersAccountInput;
}>;


export type DeletePrayerlettersAccountMutation = (
  { __typename?: 'Mutation' }
  & { deletePrayerlettersAccount: (
    { __typename?: 'DeletionResponse' }
    & Pick<Types.DeletionResponse, 'success'>
  ) }
);


export const PrayerlettersAccountDocument = gql`
    query PrayerlettersAccount($input: PrayerlettersAccountInput!) {
  prayerlettersAccount(input: $input) {
    validToken
  }
}
    `;
export function usePrayerlettersAccountQuery(baseOptions: Apollo.QueryHookOptions<PrayerlettersAccountQuery, PrayerlettersAccountQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<PrayerlettersAccountQuery, PrayerlettersAccountQueryVariables>(PrayerlettersAccountDocument, options);
      }
export function usePrayerlettersAccountLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PrayerlettersAccountQuery, PrayerlettersAccountQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<PrayerlettersAccountQuery, PrayerlettersAccountQueryVariables>(PrayerlettersAccountDocument, options);
        }
export type PrayerlettersAccountQueryHookResult = ReturnType<typeof usePrayerlettersAccountQuery>;
export type PrayerlettersAccountLazyQueryHookResult = ReturnType<typeof usePrayerlettersAccountLazyQuery>;
export type PrayerlettersAccountQueryResult = Apollo.QueryResult<PrayerlettersAccountQuery, PrayerlettersAccountQueryVariables>;
export const SyncPrayerlettersAccountDocument = gql`
    mutation SyncPrayerlettersAccount($input: SyncPrayerlettersAccountInput!) {
  syncPrayerlettersAccount(input: $input)
}
    `;
export type SyncPrayerlettersAccountMutationFn = Apollo.MutationFunction<SyncPrayerlettersAccountMutation, SyncPrayerlettersAccountMutationVariables>;
export function useSyncPrayerlettersAccountMutation(baseOptions?: Apollo.MutationHookOptions<SyncPrayerlettersAccountMutation, SyncPrayerlettersAccountMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SyncPrayerlettersAccountMutation, SyncPrayerlettersAccountMutationVariables>(SyncPrayerlettersAccountDocument, options);
      }
export type SyncPrayerlettersAccountMutationHookResult = ReturnType<typeof useSyncPrayerlettersAccountMutation>;
export type SyncPrayerlettersAccountMutationResult = Apollo.MutationResult<SyncPrayerlettersAccountMutation>;
export type SyncPrayerlettersAccountMutationOptions = Apollo.BaseMutationOptions<SyncPrayerlettersAccountMutation, SyncPrayerlettersAccountMutationVariables>;
export const DeletePrayerlettersAccountDocument = gql`
    mutation DeletePrayerlettersAccount($input: DeletePrayerlettersAccountInput!) {
  deletePrayerlettersAccount(input: $input) {
    success
  }
}
    `;
export type DeletePrayerlettersAccountMutationFn = Apollo.MutationFunction<DeletePrayerlettersAccountMutation, DeletePrayerlettersAccountMutationVariables>;
export function useDeletePrayerlettersAccountMutation(baseOptions?: Apollo.MutationHookOptions<DeletePrayerlettersAccountMutation, DeletePrayerlettersAccountMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeletePrayerlettersAccountMutation, DeletePrayerlettersAccountMutationVariables>(DeletePrayerlettersAccountDocument, options);
      }
export type DeletePrayerlettersAccountMutationHookResult = ReturnType<typeof useDeletePrayerlettersAccountMutation>;
export type DeletePrayerlettersAccountMutationResult = Apollo.MutationResult<DeletePrayerlettersAccountMutation>;
export type DeletePrayerlettersAccountMutationOptions = Apollo.BaseMutationOptions<DeletePrayerlettersAccountMutation, DeletePrayerlettersAccountMutationVariables>;