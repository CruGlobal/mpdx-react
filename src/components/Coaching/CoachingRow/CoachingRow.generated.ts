import * as Types from '../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type DeleteCoachingAccountListMutationVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  coachId: Types.Scalars['ID']['input'];
}>;

export type DeleteCoachingAccountListMutation = { __typename?: 'Mutation' } & {
  deleteAccountListCoach?: Types.Maybe<
    { __typename?: 'AccountListCoachDeleteMutationPayload' } & Pick<
      Types.AccountListCoachDeleteMutationPayload,
      'id'
    >
  >;
};

export const DeleteCoachingAccountListDocument = gql`
  mutation DeleteCoachingAccountList($accountListId: ID!, $coachId: ID!) {
    deleteAccountListCoach(
      input: { accountListId: $accountListId, coachId: $coachId }
    ) {
      id
    }
  }
`;
export type DeleteCoachingAccountListMutationFn = Apollo.MutationFunction<
  DeleteCoachingAccountListMutation,
  DeleteCoachingAccountListMutationVariables
>;
export function useDeleteCoachingAccountListMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteCoachingAccountListMutation,
    DeleteCoachingAccountListMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeleteCoachingAccountListMutation,
    DeleteCoachingAccountListMutationVariables
  >(DeleteCoachingAccountListDocument, options);
}
export type DeleteCoachingAccountListMutationHookResult = ReturnType<
  typeof useDeleteCoachingAccountListMutation
>;
export type DeleteCoachingAccountListMutationResult =
  Apollo.MutationResult<DeleteCoachingAccountListMutation>;
export type DeleteCoachingAccountListMutationOptions =
  Apollo.BaseMutationOptions<
    DeleteCoachingAccountListMutation,
    DeleteCoachingAccountListMutationVariables
  >;
