import * as Types from '../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ChangePrimaryAppealMutationVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  attributes: Types.AppealUpdateInput;
}>;

export type ChangePrimaryAppealMutation = { __typename?: 'Mutation' } & {
  setPrimary?: Types.Maybe<
    { __typename?: 'AppealUpdateMutationPayload' } & {
      appeal: { __typename?: 'Appeal' } & Pick<Types.Appeal, 'id'>;
    }
  >;
};

export const ChangePrimaryAppealDocument = gql`
  mutation ChangePrimaryAppeal(
    $accountListId: ID!
    $attributes: AppealUpdateInput!
  ) {
    setPrimary: updateAppeal(
      input: { accountListId: $accountListId, attributes: $attributes }
    ) {
      appeal {
        id
      }
    }
  }
`;
export type ChangePrimaryAppealMutationFn = Apollo.MutationFunction<
  ChangePrimaryAppealMutation,
  ChangePrimaryAppealMutationVariables
>;
export function useChangePrimaryAppealMutation(
  baseOptions?: Apollo.MutationHookOptions<
    ChangePrimaryAppealMutation,
    ChangePrimaryAppealMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    ChangePrimaryAppealMutation,
    ChangePrimaryAppealMutationVariables
  >(ChangePrimaryAppealDocument, options);
}
export type ChangePrimaryAppealMutationHookResult = ReturnType<
  typeof useChangePrimaryAppealMutation
>;
export type ChangePrimaryAppealMutationResult =
  Apollo.MutationResult<ChangePrimaryAppealMutation>;
export type ChangePrimaryAppealMutationOptions = Apollo.BaseMutationOptions<
  ChangePrimaryAppealMutation,
  ChangePrimaryAppealMutationVariables
>;
