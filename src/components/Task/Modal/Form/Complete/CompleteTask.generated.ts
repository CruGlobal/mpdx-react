import * as Types from '../../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type CompleteTaskMutationVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  attributes: Types.TaskUpdateInput;
}>;


export type CompleteTaskMutation = (
  { __typename?: 'Mutation' }
  & { updateTask?: Types.Maybe<(
    { __typename?: 'TaskUpdateMutationPayload' }
    & { task: (
      { __typename?: 'Task' }
      & Pick<Types.Task, 'id' | 'result' | 'nextAction' | 'tagList' | 'completedAt'>
    ) }
  )> }
);


export const CompleteTaskDocument = gql`
    mutation CompleteTask($accountListId: ID!, $attributes: TaskUpdateInput!) {
  updateTask(input: {accountListId: $accountListId, attributes: $attributes}) {
    task {
      id
      result
      nextAction
      tagList
      completedAt
    }
  }
}
    `;
export type CompleteTaskMutationFn = Apollo.MutationFunction<CompleteTaskMutation, CompleteTaskMutationVariables>;
export function useCompleteTaskMutation(baseOptions?: Apollo.MutationHookOptions<CompleteTaskMutation, CompleteTaskMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CompleteTaskMutation, CompleteTaskMutationVariables>(CompleteTaskDocument, options);
      }
export type CompleteTaskMutationHookResult = ReturnType<typeof useCompleteTaskMutation>;
export type CompleteTaskMutationResult = Apollo.MutationResult<CompleteTaskMutation>;
export type CompleteTaskMutationOptions = Apollo.BaseMutationOptions<CompleteTaskMutation, CompleteTaskMutationVariables>;