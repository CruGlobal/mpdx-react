import * as Types from '../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type AddToAppealMutationVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  attributes: Types.AssignContactsToAppealInput;
}>;

export type AddToAppealMutation = { __typename?: 'Mutation' } & {
  assignContactsToAppeal?: Types.Maybe<
    { __typename?: 'AssignContactsToAppealMutationPayload' } & {
      appeal: { __typename?: 'Appeal' } & Pick<Types.Appeal, 'id'>;
    }
  >;
};

export const AddToAppealDocument = gql`
  mutation AddToAppeal(
    $accountListId: ID!
    $attributes: AssignContactsToAppealInput!
  ) {
    assignContactsToAppeal(
      input: { accountListId: $accountListId, attributes: $attributes }
    ) {
      appeal {
        id
      }
    }
  }
`;
export type AddToAppealMutationFn = Apollo.MutationFunction<
  AddToAppealMutation,
  AddToAppealMutationVariables
>;
export function useAddToAppealMutation(
  baseOptions?: Apollo.MutationHookOptions<
    AddToAppealMutation,
    AddToAppealMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<AddToAppealMutation, AddToAppealMutationVariables>(
    AddToAppealDocument,
    options,
  );
}
export type AddToAppealMutationHookResult = ReturnType<
  typeof useAddToAppealMutation
>;
export type AddToAppealMutationResult =
  Apollo.MutationResult<AddToAppealMutation>;
export type AddToAppealMutationOptions = Apollo.BaseMutationOptions<
  AddToAppealMutation,
  AddToAppealMutationVariables
>;
