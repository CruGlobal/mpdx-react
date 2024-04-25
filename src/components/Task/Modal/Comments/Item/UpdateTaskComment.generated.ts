import * as Types from '../../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UpdateCommentMutationVariables = Types.Exact<{
  taskId: Types.Scalars['ID']['input'];
  commentId: Types.Scalars['ID']['input'];
  body: Types.Scalars['String']['input'];
}>;


export type UpdateCommentMutation = (
  { __typename?: 'Mutation' }
  & { updateComment: (
    { __typename?: 'CommentUpdateMutationPayload' }
    & Pick<Types.CommentUpdateMutationPayload, 'id'>
  ) }
);


export const UpdateCommentDocument = gql`
    mutation UpdateComment($taskId: ID!, $commentId: ID!, $body: String!) {
  updateComment(input: {taskId: $taskId, commentId: $commentId, body: $body}) {
    id
  }
}
    `;
export type UpdateCommentMutationFn = Apollo.MutationFunction<UpdateCommentMutation, UpdateCommentMutationVariables>;
export function useUpdateCommentMutation(baseOptions?: Apollo.MutationHookOptions<UpdateCommentMutation, UpdateCommentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateCommentMutation, UpdateCommentMutationVariables>(UpdateCommentDocument, options);
      }
export type UpdateCommentMutationHookResult = ReturnType<typeof useUpdateCommentMutation>;
export type UpdateCommentMutationResult = Apollo.MutationResult<UpdateCommentMutation>;
export type UpdateCommentMutationOptions = Apollo.BaseMutationOptions<UpdateCommentMutation, UpdateCommentMutationVariables>;