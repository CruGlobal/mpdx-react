import * as Types from '../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type OrganizationAdminsQueryVariables = Types.Exact<{
  input: Types.OrganizationAdminsInput;
}>;

export type OrganizationAdminsQuery = { __typename?: 'Query' } & {
  organizationAdmins: Array<
    Types.Maybe<
      { __typename?: 'AdminList' } & Pick<
        Types.AdminList,
        'id' | 'firstName' | 'lastName'
      >
    >
  >;
};

export type OrganizationInvitesQueryVariables = Types.Exact<{
  input: Types.OrganizationInvitesInput;
}>;

export type OrganizationInvitesQuery = { __typename?: 'Query' } & {
  organizationInvites: Array<
    Types.Maybe<
      { __typename?: 'Invite' } & Pick<
        Types.Invite,
        | 'id'
        | 'acceptedAt'
        | 'createdAt'
        | 'code'
        | 'inviteUserAs'
        | 'recipientEmail'
      >
    >
  >;
};

export type DestroyOrganizationAdminMutationVariables = Types.Exact<{
  input: Types.DeleteOrganizationAdminInput;
}>;

export type DestroyOrganizationAdminMutation = { __typename?: 'Mutation' } & {
  destroyOrganizationAdmin: { __typename?: 'DeletionResponse' } & Pick<
    Types.DeletionResponse,
    'success'
  >;
};

export type DestroyOrganizationInviteMutationVariables = Types.Exact<{
  input: Types.DeleteOrganizationInviteInput;
}>;

export type DestroyOrganizationInviteMutation = { __typename?: 'Mutation' } & {
  destroyOrganizationInvite: { __typename?: 'DeletionResponse' } & Pick<
    Types.DeletionResponse,
    'success'
  >;
};

export type CreateOrganizationInviteMutationVariables = Types.Exact<{
  input: Types.CreateOrganizationInviteInput;
}>;

export type CreateOrganizationInviteMutation = { __typename?: 'Mutation' } & {
  createOrganizationInvite: { __typename?: 'Invite' } & Pick<
    Types.Invite,
    | 'id'
    | 'recipientEmail'
    | 'inviteUserAs'
    | 'acceptedAt'
    | 'code'
    | 'createdAt'
  >;
};

export const OrganizationAdminsDocument = gql`
  query OrganizationAdmins($input: OrganizationAdminsInput!) {
    organizationAdmins(input: $input) {
      id
      firstName
      lastName
    }
  }
`;
export function useOrganizationAdminsQuery(
  baseOptions: Apollo.QueryHookOptions<
    OrganizationAdminsQuery,
    OrganizationAdminsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    OrganizationAdminsQuery,
    OrganizationAdminsQueryVariables
  >(OrganizationAdminsDocument, options);
}
export function useOrganizationAdminsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    OrganizationAdminsQuery,
    OrganizationAdminsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    OrganizationAdminsQuery,
    OrganizationAdminsQueryVariables
  >(OrganizationAdminsDocument, options);
}
export type OrganizationAdminsQueryHookResult = ReturnType<
  typeof useOrganizationAdminsQuery
>;
export type OrganizationAdminsLazyQueryHookResult = ReturnType<
  typeof useOrganizationAdminsLazyQuery
>;
export type OrganizationAdminsQueryResult = Apollo.QueryResult<
  OrganizationAdminsQuery,
  OrganizationAdminsQueryVariables
>;
export const OrganizationInvitesDocument = gql`
  query OrganizationInvites($input: OrganizationInvitesInput!) {
    organizationInvites(input: $input) {
      id
      acceptedAt
      createdAt
      code
      inviteUserAs
      recipientEmail
    }
  }
`;
export function useOrganizationInvitesQuery(
  baseOptions: Apollo.QueryHookOptions<
    OrganizationInvitesQuery,
    OrganizationInvitesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    OrganizationInvitesQuery,
    OrganizationInvitesQueryVariables
  >(OrganizationInvitesDocument, options);
}
export function useOrganizationInvitesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    OrganizationInvitesQuery,
    OrganizationInvitesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    OrganizationInvitesQuery,
    OrganizationInvitesQueryVariables
  >(OrganizationInvitesDocument, options);
}
export type OrganizationInvitesQueryHookResult = ReturnType<
  typeof useOrganizationInvitesQuery
>;
export type OrganizationInvitesLazyQueryHookResult = ReturnType<
  typeof useOrganizationInvitesLazyQuery
>;
export type OrganizationInvitesQueryResult = Apollo.QueryResult<
  OrganizationInvitesQuery,
  OrganizationInvitesQueryVariables
>;
export const DestroyOrganizationAdminDocument = gql`
  mutation DestroyOrganizationAdmin($input: DeleteOrganizationAdminInput!) {
    destroyOrganizationAdmin(input: $input) {
      success
    }
  }
`;
export type DestroyOrganizationAdminMutationFn = Apollo.MutationFunction<
  DestroyOrganizationAdminMutation,
  DestroyOrganizationAdminMutationVariables
>;
export function useDestroyOrganizationAdminMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DestroyOrganizationAdminMutation,
    DestroyOrganizationAdminMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DestroyOrganizationAdminMutation,
    DestroyOrganizationAdminMutationVariables
  >(DestroyOrganizationAdminDocument, options);
}
export type DestroyOrganizationAdminMutationHookResult = ReturnType<
  typeof useDestroyOrganizationAdminMutation
>;
export type DestroyOrganizationAdminMutationResult =
  Apollo.MutationResult<DestroyOrganizationAdminMutation>;
export type DestroyOrganizationAdminMutationOptions =
  Apollo.BaseMutationOptions<
    DestroyOrganizationAdminMutation,
    DestroyOrganizationAdminMutationVariables
  >;
export const DestroyOrganizationInviteDocument = gql`
  mutation DestroyOrganizationInvite($input: DeleteOrganizationInviteInput!) {
    destroyOrganizationInvite(input: $input) {
      success
    }
  }
`;
export type DestroyOrganizationInviteMutationFn = Apollo.MutationFunction<
  DestroyOrganizationInviteMutation,
  DestroyOrganizationInviteMutationVariables
>;
export function useDestroyOrganizationInviteMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DestroyOrganizationInviteMutation,
    DestroyOrganizationInviteMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DestroyOrganizationInviteMutation,
    DestroyOrganizationInviteMutationVariables
  >(DestroyOrganizationInviteDocument, options);
}
export type DestroyOrganizationInviteMutationHookResult = ReturnType<
  typeof useDestroyOrganizationInviteMutation
>;
export type DestroyOrganizationInviteMutationResult =
  Apollo.MutationResult<DestroyOrganizationInviteMutation>;
export type DestroyOrganizationInviteMutationOptions =
  Apollo.BaseMutationOptions<
    DestroyOrganizationInviteMutation,
    DestroyOrganizationInviteMutationVariables
  >;
export const CreateOrganizationInviteDocument = gql`
  mutation CreateOrganizationInvite($input: CreateOrganizationInviteInput!) {
    createOrganizationInvite(input: $input) {
      id
      recipientEmail
      inviteUserAs
      acceptedAt
      code
      createdAt
    }
  }
`;
export type CreateOrganizationInviteMutationFn = Apollo.MutationFunction<
  CreateOrganizationInviteMutation,
  CreateOrganizationInviteMutationVariables
>;
export function useCreateOrganizationInviteMutation(
  baseOptions?: Apollo.MutationHookOptions<
    CreateOrganizationInviteMutation,
    CreateOrganizationInviteMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    CreateOrganizationInviteMutation,
    CreateOrganizationInviteMutationVariables
  >(CreateOrganizationInviteDocument, options);
}
export type CreateOrganizationInviteMutationHookResult = ReturnType<
  typeof useCreateOrganizationInviteMutation
>;
export type CreateOrganizationInviteMutationResult =
  Apollo.MutationResult<CreateOrganizationInviteMutation>;
export type CreateOrganizationInviteMutationOptions =
  Apollo.BaseMutationOptions<
    CreateOrganizationInviteMutation,
    CreateOrganizationInviteMutationVariables
  >;
