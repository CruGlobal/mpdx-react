import * as Types from '../../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import { TaskModalCommentFragmentDoc } from '../TaskListComments.generated';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type CreateTaskCommentMutationVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  taskId: Types.Scalars['ID']['input'];
  attributes: Types.TaskCommentCreateInput;
}>;

export type CreateTaskCommentMutation = { __typename?: 'Mutation' } & {
  createTaskComment?: Types.Maybe<
    { __typename?: 'TaskCommentCreateMutationPayload' } & {
      comment: { __typename?: 'Comment' } & Pick<
        Types.Comment,
        'id' | 'body' | 'updatedAt' | 'me'
      > & {
          person?: Types.Maybe<
            { __typename?: 'UserScopedToAccountList' } & Pick<
              Types.UserScopedToAccountList,
              'id' | 'firstName' | 'lastName'
            >
          >;
        };
    }
  >;
};

export const CreateTaskCommentDocument = gql`
  mutation CreateTaskComment(
    $accountListId: ID!
    $taskId: ID!
    $attributes: TaskCommentCreateInput!
  ) {
    createTaskComment(
      input: {
        accountListId: $accountListId
        taskId: $taskId
        attributes: $attributes
      }
    ) {
      comment {
        ...TaskModalComment
      }
    }
  }
  ${TaskModalCommentFragmentDoc}
`;
export type CreateTaskCommentMutationFn = Apollo.MutationFunction<
  CreateTaskCommentMutation,
  CreateTaskCommentMutationVariables
>;
export function useCreateTaskCommentMutation(
  baseOptions?: Apollo.MutationHookOptions<
    CreateTaskCommentMutation,
    CreateTaskCommentMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    CreateTaskCommentMutation,
    CreateTaskCommentMutationVariables
  >(CreateTaskCommentDocument, options);
}
export type CreateTaskCommentMutationHookResult = ReturnType<
  typeof useCreateTaskCommentMutation
>;
export type CreateTaskCommentMutationResult =
  Apollo.MutationResult<CreateTaskCommentMutation>;
export type CreateTaskCommentMutationOptions = Apollo.BaseMutationOptions<
  CreateTaskCommentMutation,
  CreateTaskCommentMutationVariables
>;
