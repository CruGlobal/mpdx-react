import * as Types from '../../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type AdminDeleteOrganizationUserMutationVariables = Types.Exact<{
  input: Types.AdminDeleteOrganizationUserInput;
}>;

export type AdminDeleteOrganizationUserMutation = {
  __typename?: 'Mutation';
} & {
  adminDeleteOrganizationUser: { __typename?: 'DeletionResponse' } & Pick<
    Types.DeletionResponse,
    'success'
  >;
};

export type AdminDeleteOrganizationCoachMutationVariables = Types.Exact<{
  input: Types.AdminDeleteOrganizationCoachInput;
}>;

export type AdminDeleteOrganizationCoachMutation = {
  __typename?: 'Mutation';
} & {
  adminDeleteOrganizationCoach: { __typename?: 'DeletionResponse' } & Pick<
    Types.DeletionResponse,
    'success'
  >;
};

export const AdminDeleteOrganizationUserDocument = gql`
  mutation AdminDeleteOrganizationUser(
    $input: AdminDeleteOrganizationUserInput!
  ) {
    adminDeleteOrganizationUser(input: $input) {
      success
    }
  }
`;
export type AdminDeleteOrganizationUserMutationFn = Apollo.MutationFunction<
  AdminDeleteOrganizationUserMutation,
  AdminDeleteOrganizationUserMutationVariables
>;
export function useAdminDeleteOrganizationUserMutation(
  baseOptions?: Apollo.MutationHookOptions<
    AdminDeleteOrganizationUserMutation,
    AdminDeleteOrganizationUserMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    AdminDeleteOrganizationUserMutation,
    AdminDeleteOrganizationUserMutationVariables
  >(AdminDeleteOrganizationUserDocument, options);
}
export type AdminDeleteOrganizationUserMutationHookResult = ReturnType<
  typeof useAdminDeleteOrganizationUserMutation
>;
export type AdminDeleteOrganizationUserMutationResult =
  Apollo.MutationResult<AdminDeleteOrganizationUserMutation>;
export type AdminDeleteOrganizationUserMutationOptions =
  Apollo.BaseMutationOptions<
    AdminDeleteOrganizationUserMutation,
    AdminDeleteOrganizationUserMutationVariables
  >;
export const AdminDeleteOrganizationCoachDocument = gql`
  mutation AdminDeleteOrganizationCoach(
    $input: AdminDeleteOrganizationCoachInput!
  ) {
    adminDeleteOrganizationCoach(input: $input) {
      success
    }
  }
`;
export type AdminDeleteOrganizationCoachMutationFn = Apollo.MutationFunction<
  AdminDeleteOrganizationCoachMutation,
  AdminDeleteOrganizationCoachMutationVariables
>;
export function useAdminDeleteOrganizationCoachMutation(
  baseOptions?: Apollo.MutationHookOptions<
    AdminDeleteOrganizationCoachMutation,
    AdminDeleteOrganizationCoachMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    AdminDeleteOrganizationCoachMutation,
    AdminDeleteOrganizationCoachMutationVariables
  >(AdminDeleteOrganizationCoachDocument, options);
}
export type AdminDeleteOrganizationCoachMutationHookResult = ReturnType<
  typeof useAdminDeleteOrganizationCoachMutation
>;
export type AdminDeleteOrganizationCoachMutationResult =
  Apollo.MutationResult<AdminDeleteOrganizationCoachMutation>;
export type AdminDeleteOrganizationCoachMutationOptions =
  Apollo.BaseMutationOptions<
    AdminDeleteOrganizationCoachMutation,
    AdminDeleteOrganizationCoachMutationVariables
  >;
