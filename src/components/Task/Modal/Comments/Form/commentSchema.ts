import * as yup from 'yup';

export const commentSchema = yup.object({
  body: yup.string().trim().required(),
});

export type CommentSchemaAttributes = yup.InferType<typeof commentSchema>;
