import { CommentUpdateMutationPayload } from '../../../../graphql-rest.page.generated';

export interface UpdateCommentResponse {
  id: string;
}

export const UpdateComment = (
  data: UpdateCommentResponse,
): CommentUpdateMutationPayload => ({
  id: data?.id,
});
