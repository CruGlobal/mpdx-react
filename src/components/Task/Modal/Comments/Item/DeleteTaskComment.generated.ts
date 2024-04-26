import * as Types from '../../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type DeleteCommentMutationVariables = Types.Exact<{
  taskId: Types.Scalars['ID']['input'];
  commentId: Types.Scalars['ID']['input'];
}>;

export type DeleteCommentMutation = { __typename?: 'Mutation' } & {
  deleteComment: { __typename?: 'CommentDeleteMutationPayload' } & Pick<
    Types.CommentDeleteMutationPayload,
    'id'
  >;
};

export const DeleteCommentDocument = gql`
  mutation DeleteComment($taskId: ID!, $commentId: ID!) {
    deleteComment(input: { taskId: $taskId, commentId: $commentId }) {
      id
    }
  }
`;
export type DeleteCommentMutationFn = Apollo.MutationFunction<
  DeleteCommentMutation,
  DeleteCommentMutationVariables
>;
export function useDeleteCommentMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteCommentMutation,
    DeleteCommentMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeleteCommentMutation,
    DeleteCommentMutationVariables
  >(DeleteCommentDocument, options);
}
export type DeleteCommentMutationHookResult = ReturnType<
  typeof useDeleteCommentMutation
>;
export type DeleteCommentMutationResult =
  Apollo.MutationResult<DeleteCommentMutation>;
export type DeleteCommentMutationOptions = Apollo.BaseMutationOptions<
  DeleteCommentMutation,
  DeleteCommentMutationVariables
>;
