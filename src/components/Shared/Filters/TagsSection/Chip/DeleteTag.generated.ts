import * as Types from '../../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type DeleteTagMutationVariables = Types.Exact<{
  tagName: Types.Scalars['String']['input'];
  page: Types.Scalars['String']['input'];
}>;

export type DeleteTagMutation = { __typename?: 'Mutation' } & {
  deleteTags?: Types.Maybe<
    { __typename?: 'DeleteTagsPayload' } & Pick<Types.DeleteTagsPayload, 'id'>
  >;
};

export const DeleteTagDocument = gql`
  mutation DeleteTag($tagName: String!, $page: String!) {
    deleteTags(input: { tagName: $tagName, page: $page }) {
      id
    }
  }
`;
export type DeleteTagMutationFn = Apollo.MutationFunction<
  DeleteTagMutation,
  DeleteTagMutationVariables
>;
export function useDeleteTagMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteTagMutation,
    DeleteTagMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<DeleteTagMutation, DeleteTagMutationVariables>(
    DeleteTagDocument,
    options,
  );
}
export type DeleteTagMutationHookResult = ReturnType<
  typeof useDeleteTagMutation
>;
export type DeleteTagMutationResult = Apollo.MutationResult<DeleteTagMutation>;
export type DeleteTagMutationOptions = Apollo.BaseMutationOptions<
  DeleteTagMutation,
  DeleteTagMutationVariables
>;
