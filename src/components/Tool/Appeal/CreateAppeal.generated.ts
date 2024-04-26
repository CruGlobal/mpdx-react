import * as Types from '../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type CreateAppealMutationVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  attributes: Types.AppealCreateInput;
}>;

export type CreateAppealMutation = { __typename?: 'Mutation' } & {
  createAppeal?: Types.Maybe<
    { __typename?: 'AppealCreateMutationPayload' } & {
      appeal: { __typename?: 'Appeal' } & Pick<Types.Appeal, 'id'>;
    }
  >;
};

export const CreateAppealDocument = gql`
  mutation CreateAppeal($accountListId: ID!, $attributes: AppealCreateInput!) {
    createAppeal(
      input: { accountListId: $accountListId, attributes: $attributes }
    ) {
      appeal {
        id
      }
    }
  }
`;
export type CreateAppealMutationFn = Apollo.MutationFunction<
  CreateAppealMutation,
  CreateAppealMutationVariables
>;
export function useCreateAppealMutation(
  baseOptions?: Apollo.MutationHookOptions<
    CreateAppealMutation,
    CreateAppealMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    CreateAppealMutation,
    CreateAppealMutationVariables
  >(CreateAppealDocument, options);
}
export type CreateAppealMutationHookResult = ReturnType<
  typeof useCreateAppealMutation
>;
export type CreateAppealMutationResult =
  Apollo.MutationResult<CreateAppealMutation>;
export type CreateAppealMutationOptions = Apollo.BaseMutationOptions<
  CreateAppealMutation,
  CreateAppealMutationVariables
>;
