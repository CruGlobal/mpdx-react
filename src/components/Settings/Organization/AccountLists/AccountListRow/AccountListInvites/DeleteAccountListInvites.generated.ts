import * as Types from '../../../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type AdminDeleteOrganizationInviteMutationVariables = Types.Exact<{
  input: Types.AdminDeleteOrganizationInviteInput;
}>;

export type AdminDeleteOrganizationInviteMutation = {
  __typename?: 'Mutation';
} & {
  adminDeleteOrganizationInvite: { __typename?: 'DeletionResponse' } & Pick<
    Types.DeletionResponse,
    'success'
  >;
};

export const AdminDeleteOrganizationInviteDocument = gql`
  mutation AdminDeleteOrganizationInvite(
    $input: AdminDeleteOrganizationInviteInput!
  ) {
    adminDeleteOrganizationInvite(input: $input) {
      success
    }
  }
`;
export type AdminDeleteOrganizationInviteMutationFn = Apollo.MutationFunction<
  AdminDeleteOrganizationInviteMutation,
  AdminDeleteOrganizationInviteMutationVariables
>;
export function useAdminDeleteOrganizationInviteMutation(
  baseOptions?: Apollo.MutationHookOptions<
    AdminDeleteOrganizationInviteMutation,
    AdminDeleteOrganizationInviteMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    AdminDeleteOrganizationInviteMutation,
    AdminDeleteOrganizationInviteMutationVariables
  >(AdminDeleteOrganizationInviteDocument, options);
}
export type AdminDeleteOrganizationInviteMutationHookResult = ReturnType<
  typeof useAdminDeleteOrganizationInviteMutation
>;
export type AdminDeleteOrganizationInviteMutationResult =
  Apollo.MutationResult<AdminDeleteOrganizationInviteMutation>;
export type AdminDeleteOrganizationInviteMutationOptions =
  Apollo.BaseMutationOptions<
    AdminDeleteOrganizationInviteMutation,
    AdminDeleteOrganizationInviteMutationVariables
  >;
