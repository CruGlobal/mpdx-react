import { CommentDeleteMutationPayload } from '../../../../graphql-rest.page.generated';

export interface DeleteCommentResponse {
  id: string;
}

export const DeleteComment = (
  data: DeleteCommentResponse,
): CommentDeleteMutationPayload => ({
  id: data?.id,
});
