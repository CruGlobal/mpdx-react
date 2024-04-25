import * as Types from '../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type MailchimpAccountQueryVariables = Types.Exact<{
  input: Types.MailchimpAccountInput;
}>;


export type MailchimpAccountQuery = (
  { __typename?: 'Query' }
  & { mailchimpAccount?: Types.Maybe<Array<Types.Maybe<(
    { __typename?: 'MailchimpAccount' }
    & Pick<Types.MailchimpAccount, 'id' | 'active' | 'autoLogCampaigns' | 'createdAt' | 'listsLink' | 'listsPresent' | 'primaryListId' | 'primaryListName' | 'updatedAt' | 'updatedInDbAt' | 'valid' | 'validateKey' | 'validationError'>
    & { listsAvailableForNewsletters?: Types.Maybe<Array<Types.Maybe<(
      { __typename?: 'ListsAvailableForNewsletters' }
      & Pick<Types.ListsAvailableForNewsletters, 'id' | 'name'>
    )>>> }
  )>>> }
);

export type UpdateMailchimpAccountMutationVariables = Types.Exact<{
  input: Types.UpdateMailchimpAccountInput;
}>;


export type UpdateMailchimpAccountMutation = (
  { __typename?: 'Mutation' }
  & { updateMailchimpAccount: (
    { __typename?: 'MailchimpAccount' }
    & Pick<Types.MailchimpAccount, 'id' | 'active' | 'autoLogCampaigns' | 'createdAt' | 'listsLink' | 'listsPresent' | 'primaryListId' | 'primaryListName' | 'updatedAt' | 'updatedInDbAt' | 'valid' | 'validateKey' | 'validationError'>
    & { listsAvailableForNewsletters?: Types.Maybe<Array<Types.Maybe<(
      { __typename?: 'ListsAvailableForNewsletters' }
      & Pick<Types.ListsAvailableForNewsletters, 'id' | 'name'>
    )>>> }
  ) }
);

export type SyncMailchimpAccountMutationVariables = Types.Exact<{
  input: Types.SyncMailchimpAccountInput;
}>;


export type SyncMailchimpAccountMutation = (
  { __typename?: 'Mutation' }
  & Pick<Types.Mutation, 'syncMailchimpAccount'>
);

export type DeleteMailchimpAccountMutationVariables = Types.Exact<{
  input: Types.DeleteMailchimpAccountInput;
}>;


export type DeleteMailchimpAccountMutation = (
  { __typename?: 'Mutation' }
  & { deleteMailchimpAccount: (
    { __typename?: 'DeletionResponse' }
    & Pick<Types.DeletionResponse, 'success'>
  ) }
);


export const MailchimpAccountDocument = gql`
    query MailchimpAccount($input: MailchimpAccountInput!) {
  mailchimpAccount(input: $input) {
    id
    active
    autoLogCampaigns
    createdAt
    listsAvailableForNewsletters {
      id
      name
    }
    listsLink
    listsPresent
    primaryListId
    primaryListName
    updatedAt
    updatedInDbAt
    valid
    validateKey
    validationError
  }
}
    `;
export function useMailchimpAccountQuery(baseOptions: Apollo.QueryHookOptions<MailchimpAccountQuery, MailchimpAccountQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MailchimpAccountQuery, MailchimpAccountQueryVariables>(MailchimpAccountDocument, options);
      }
export function useMailchimpAccountLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MailchimpAccountQuery, MailchimpAccountQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MailchimpAccountQuery, MailchimpAccountQueryVariables>(MailchimpAccountDocument, options);
        }
export type MailchimpAccountQueryHookResult = ReturnType<typeof useMailchimpAccountQuery>;
export type MailchimpAccountLazyQueryHookResult = ReturnType<typeof useMailchimpAccountLazyQuery>;
export type MailchimpAccountQueryResult = Apollo.QueryResult<MailchimpAccountQuery, MailchimpAccountQueryVariables>;
export const UpdateMailchimpAccountDocument = gql`
    mutation UpdateMailchimpAccount($input: UpdateMailchimpAccountInput!) {
  updateMailchimpAccount(input: $input) {
    id
    active
    autoLogCampaigns
    createdAt
    listsAvailableForNewsletters {
      id
      name
    }
    listsLink
    listsPresent
    primaryListId
    primaryListName
    updatedAt
    updatedInDbAt
    valid
    validateKey
    validationError
  }
}
    `;
export type UpdateMailchimpAccountMutationFn = Apollo.MutationFunction<UpdateMailchimpAccountMutation, UpdateMailchimpAccountMutationVariables>;
export function useUpdateMailchimpAccountMutation(baseOptions?: Apollo.MutationHookOptions<UpdateMailchimpAccountMutation, UpdateMailchimpAccountMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateMailchimpAccountMutation, UpdateMailchimpAccountMutationVariables>(UpdateMailchimpAccountDocument, options);
      }
export type UpdateMailchimpAccountMutationHookResult = ReturnType<typeof useUpdateMailchimpAccountMutation>;
export type UpdateMailchimpAccountMutationResult = Apollo.MutationResult<UpdateMailchimpAccountMutation>;
export type UpdateMailchimpAccountMutationOptions = Apollo.BaseMutationOptions<UpdateMailchimpAccountMutation, UpdateMailchimpAccountMutationVariables>;
export const SyncMailchimpAccountDocument = gql`
    mutation SyncMailchimpAccount($input: SyncMailchimpAccountInput!) {
  syncMailchimpAccount(input: $input)
}
    `;
export type SyncMailchimpAccountMutationFn = Apollo.MutationFunction<SyncMailchimpAccountMutation, SyncMailchimpAccountMutationVariables>;
export function useSyncMailchimpAccountMutation(baseOptions?: Apollo.MutationHookOptions<SyncMailchimpAccountMutation, SyncMailchimpAccountMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SyncMailchimpAccountMutation, SyncMailchimpAccountMutationVariables>(SyncMailchimpAccountDocument, options);
      }
export type SyncMailchimpAccountMutationHookResult = ReturnType<typeof useSyncMailchimpAccountMutation>;
export type SyncMailchimpAccountMutationResult = Apollo.MutationResult<SyncMailchimpAccountMutation>;
export type SyncMailchimpAccountMutationOptions = Apollo.BaseMutationOptions<SyncMailchimpAccountMutation, SyncMailchimpAccountMutationVariables>;
export const DeleteMailchimpAccountDocument = gql`
    mutation DeleteMailchimpAccount($input: DeleteMailchimpAccountInput!) {
  deleteMailchimpAccount(input: $input) {
    success
  }
}
    `;
export type DeleteMailchimpAccountMutationFn = Apollo.MutationFunction<DeleteMailchimpAccountMutation, DeleteMailchimpAccountMutationVariables>;
export function useDeleteMailchimpAccountMutation(baseOptions?: Apollo.MutationHookOptions<DeleteMailchimpAccountMutation, DeleteMailchimpAccountMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteMailchimpAccountMutation, DeleteMailchimpAccountMutationVariables>(DeleteMailchimpAccountDocument, options);
      }
export type DeleteMailchimpAccountMutationHookResult = ReturnType<typeof useDeleteMailchimpAccountMutation>;
export type DeleteMailchimpAccountMutationResult = Apollo.MutationResult<DeleteMailchimpAccountMutation>;
export type DeleteMailchimpAccountMutationOptions = Apollo.BaseMutationOptions<DeleteMailchimpAccountMutation, DeleteMailchimpAccountMutationVariables>;