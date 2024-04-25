import * as Types from '../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetOrganizationsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetOrganizationsQuery = (
  { __typename?: 'Query' }
  & { organizations: Array<(
    { __typename?: 'Organization' }
    & Pick<Types.Organization, 'id' | 'name' | 'apiClass' | 'oauth' | 'giftAidPercentage' | 'disableNewUsers'>
  )> }
);

export type GetUsersOrganizationsAccountsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetUsersOrganizationsAccountsQuery = (
  { __typename?: 'Query' }
  & { userOrganizationAccounts: Array<(
    { __typename?: 'OrganizationAccount' }
    & Pick<Types.OrganizationAccount, 'latestDonationDate' | 'lastDownloadedAt' | 'username' | 'id'>
    & { organization: (
      { __typename?: 'Organization' }
      & Pick<Types.Organization, 'apiClass' | 'id' | 'name' | 'oauth'>
    ) }
  )> }
);

export type DeleteOrganizationAccountMutationVariables = Types.Exact<{
  input: Types.OrganizationAccountDeleteMutationInput;
}>;


export type DeleteOrganizationAccountMutation = (
  { __typename?: 'Mutation' }
  & { deleteOrganizationAccount?: Types.Maybe<(
    { __typename?: 'OrganizationAccountDeleteMutationPayload' }
    & Pick<Types.OrganizationAccountDeleteMutationPayload, 'id'>
  )> }
);

export type CreateOrganizationAccountMutationVariables = Types.Exact<{
  input: Types.OrganizationAccountCreateMutationInput;
}>;


export type CreateOrganizationAccountMutation = (
  { __typename?: 'Mutation' }
  & { createOrganizationAccount?: Types.Maybe<(
    { __typename?: 'OrganizationAccountCreateMutationPayload' }
    & { organizationAccount: (
      { __typename?: 'OrganizationAccount' }
      & Pick<Types.OrganizationAccount, 'id' | 'username'>
      & { person: (
        { __typename?: 'Person' }
        & Pick<Types.Person, 'id'>
      ) }
    ) }
  )> }
);

export type SyncOrganizationAccountMutationVariables = Types.Exact<{
  input: Types.OrganizationAccountSyncMutationInput;
}>;


export type SyncOrganizationAccountMutation = (
  { __typename?: 'Mutation' }
  & { syncOrganizationAccount?: Types.Maybe<(
    { __typename?: 'OrganizationAccountSyncMutationPayload' }
    & { organizationAccount: (
      { __typename?: 'OrganizationAccount' }
      & Pick<Types.OrganizationAccount, 'id'>
    ) }
  )> }
);

export type UpdateOrganizationAccountMutationVariables = Types.Exact<{
  input: Types.OrganizationAccountUpdateMutationInput;
}>;


export type UpdateOrganizationAccountMutation = (
  { __typename?: 'Mutation' }
  & { updateOrganizationAccount?: Types.Maybe<(
    { __typename?: 'OrganizationAccountUpdateMutationPayload' }
    & { organizationAccount: (
      { __typename?: 'OrganizationAccount' }
      & Pick<Types.OrganizationAccount, 'id'>
    ) }
  )> }
);


export const GetOrganizationsDocument = gql`
    query getOrganizations {
  organizations {
    id
    name
    apiClass
    oauth
    giftAidPercentage
    disableNewUsers
  }
}
    `;
export function useGetOrganizationsQuery(baseOptions?: Apollo.QueryHookOptions<GetOrganizationsQuery, GetOrganizationsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetOrganizationsQuery, GetOrganizationsQueryVariables>(GetOrganizationsDocument, options);
      }
export function useGetOrganizationsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetOrganizationsQuery, GetOrganizationsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetOrganizationsQuery, GetOrganizationsQueryVariables>(GetOrganizationsDocument, options);
        }
export type GetOrganizationsQueryHookResult = ReturnType<typeof useGetOrganizationsQuery>;
export type GetOrganizationsLazyQueryHookResult = ReturnType<typeof useGetOrganizationsLazyQuery>;
export type GetOrganizationsQueryResult = Apollo.QueryResult<GetOrganizationsQuery, GetOrganizationsQueryVariables>;
export const GetUsersOrganizationsAccountsDocument = gql`
    query GetUsersOrganizationsAccounts {
  userOrganizationAccounts {
    organization {
      apiClass
      id
      name
      oauth
    }
    latestDonationDate
    lastDownloadedAt
    username
    id
  }
}
    `;
export function useGetUsersOrganizationsAccountsQuery(baseOptions?: Apollo.QueryHookOptions<GetUsersOrganizationsAccountsQuery, GetUsersOrganizationsAccountsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUsersOrganizationsAccountsQuery, GetUsersOrganizationsAccountsQueryVariables>(GetUsersOrganizationsAccountsDocument, options);
      }
export function useGetUsersOrganizationsAccountsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUsersOrganizationsAccountsQuery, GetUsersOrganizationsAccountsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUsersOrganizationsAccountsQuery, GetUsersOrganizationsAccountsQueryVariables>(GetUsersOrganizationsAccountsDocument, options);
        }
export type GetUsersOrganizationsAccountsQueryHookResult = ReturnType<typeof useGetUsersOrganizationsAccountsQuery>;
export type GetUsersOrganizationsAccountsLazyQueryHookResult = ReturnType<typeof useGetUsersOrganizationsAccountsLazyQuery>;
export type GetUsersOrganizationsAccountsQueryResult = Apollo.QueryResult<GetUsersOrganizationsAccountsQuery, GetUsersOrganizationsAccountsQueryVariables>;
export const DeleteOrganizationAccountDocument = gql`
    mutation DeleteOrganizationAccount($input: OrganizationAccountDeleteMutationInput!) {
  deleteOrganizationAccount(input: $input) {
    id
  }
}
    `;
export type DeleteOrganizationAccountMutationFn = Apollo.MutationFunction<DeleteOrganizationAccountMutation, DeleteOrganizationAccountMutationVariables>;
export function useDeleteOrganizationAccountMutation(baseOptions?: Apollo.MutationHookOptions<DeleteOrganizationAccountMutation, DeleteOrganizationAccountMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteOrganizationAccountMutation, DeleteOrganizationAccountMutationVariables>(DeleteOrganizationAccountDocument, options);
      }
export type DeleteOrganizationAccountMutationHookResult = ReturnType<typeof useDeleteOrganizationAccountMutation>;
export type DeleteOrganizationAccountMutationResult = Apollo.MutationResult<DeleteOrganizationAccountMutation>;
export type DeleteOrganizationAccountMutationOptions = Apollo.BaseMutationOptions<DeleteOrganizationAccountMutation, DeleteOrganizationAccountMutationVariables>;
export const CreateOrganizationAccountDocument = gql`
    mutation CreateOrganizationAccount($input: OrganizationAccountCreateMutationInput!) {
  createOrganizationAccount(input: $input) {
    organizationAccount {
      id
      username
      person {
        id
      }
    }
  }
}
    `;
export type CreateOrganizationAccountMutationFn = Apollo.MutationFunction<CreateOrganizationAccountMutation, CreateOrganizationAccountMutationVariables>;
export function useCreateOrganizationAccountMutation(baseOptions?: Apollo.MutationHookOptions<CreateOrganizationAccountMutation, CreateOrganizationAccountMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateOrganizationAccountMutation, CreateOrganizationAccountMutationVariables>(CreateOrganizationAccountDocument, options);
      }
export type CreateOrganizationAccountMutationHookResult = ReturnType<typeof useCreateOrganizationAccountMutation>;
export type CreateOrganizationAccountMutationResult = Apollo.MutationResult<CreateOrganizationAccountMutation>;
export type CreateOrganizationAccountMutationOptions = Apollo.BaseMutationOptions<CreateOrganizationAccountMutation, CreateOrganizationAccountMutationVariables>;
export const SyncOrganizationAccountDocument = gql`
    mutation SyncOrganizationAccount($input: OrganizationAccountSyncMutationInput!) {
  syncOrganizationAccount(input: $input) {
    organizationAccount {
      id
    }
  }
}
    `;
export type SyncOrganizationAccountMutationFn = Apollo.MutationFunction<SyncOrganizationAccountMutation, SyncOrganizationAccountMutationVariables>;
export function useSyncOrganizationAccountMutation(baseOptions?: Apollo.MutationHookOptions<SyncOrganizationAccountMutation, SyncOrganizationAccountMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SyncOrganizationAccountMutation, SyncOrganizationAccountMutationVariables>(SyncOrganizationAccountDocument, options);
      }
export type SyncOrganizationAccountMutationHookResult = ReturnType<typeof useSyncOrganizationAccountMutation>;
export type SyncOrganizationAccountMutationResult = Apollo.MutationResult<SyncOrganizationAccountMutation>;
export type SyncOrganizationAccountMutationOptions = Apollo.BaseMutationOptions<SyncOrganizationAccountMutation, SyncOrganizationAccountMutationVariables>;
export const UpdateOrganizationAccountDocument = gql`
    mutation UpdateOrganizationAccount($input: OrganizationAccountUpdateMutationInput!) {
  updateOrganizationAccount(input: $input) {
    organizationAccount {
      id
    }
  }
}
    `;
export type UpdateOrganizationAccountMutationFn = Apollo.MutationFunction<UpdateOrganizationAccountMutation, UpdateOrganizationAccountMutationVariables>;
export function useUpdateOrganizationAccountMutation(baseOptions?: Apollo.MutationHookOptions<UpdateOrganizationAccountMutation, UpdateOrganizationAccountMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateOrganizationAccountMutation, UpdateOrganizationAccountMutationVariables>(UpdateOrganizationAccountDocument, options);
      }
export type UpdateOrganizationAccountMutationHookResult = ReturnType<typeof useUpdateOrganizationAccountMutation>;
export type UpdateOrganizationAccountMutationResult = Apollo.MutationResult<UpdateOrganizationAccountMutation>;
export type UpdateOrganizationAccountMutationOptions = Apollo.BaseMutationOptions<UpdateOrganizationAccountMutation, UpdateOrganizationAccountMutationVariables>;