import * as Types from '../../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type SetTaskStarredMutationVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  taskId: Types.Scalars['ID']['input'];
  starred: Types.Scalars['Boolean']['input'];
}>;

export type SetTaskStarredMutation = { __typename?: 'Mutation' } & {
  updateTask?: Types.Maybe<
    { __typename?: 'TaskUpdateMutationPayload' } & {
      task: { __typename?: 'Task' } & Pick<Types.Task, 'id' | 'starred'>;
    }
  >;
};

export const SetTaskStarredDocument = gql`
  mutation SetTaskStarred(
    $accountListId: ID!
    $taskId: ID!
    $starred: Boolean!
  ) {
    updateTask(
      input: {
        accountListId: $accountListId
        attributes: { id: $taskId, starred: $starred }
      }
    ) {
      task {
        id
        starred
      }
    }
  }
`;
export type SetTaskStarredMutationFn = Apollo.MutationFunction<
  SetTaskStarredMutation,
  SetTaskStarredMutationVariables
>;
export function useSetTaskStarredMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SetTaskStarredMutation,
    SetTaskStarredMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SetTaskStarredMutation,
    SetTaskStarredMutationVariables
  >(SetTaskStarredDocument, options);
}
export type SetTaskStarredMutationHookResult = ReturnType<
  typeof useSetTaskStarredMutation
>;
export type SetTaskStarredMutationResult =
  Apollo.MutationResult<SetTaskStarredMutation>;
export type SetTaskStarredMutationOptions = Apollo.BaseMutationOptions<
  SetTaskStarredMutation,
  SetTaskStarredMutationVariables
>;
