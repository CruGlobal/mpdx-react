import * as Types from '../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type TaskModalCommentFragment = { __typename?: 'Comment' } & Pick<
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

export type GetCommentsForTaskModalCommentListQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  taskId: Types.Scalars['ID']['input'];
}>;

export type GetCommentsForTaskModalCommentListQuery = {
  __typename?: 'Query';
} & {
  task: { __typename?: 'Task' } & Pick<Types.Task, 'id'> & {
      comments: { __typename?: 'CommentConnection' } & {
        nodes: Array<
          { __typename?: 'Comment' } & Pick<
            Types.Comment,
            'id' | 'body' | 'updatedAt' | 'me'
          > & {
              person?: Types.Maybe<
                { __typename?: 'UserScopedToAccountList' } & Pick<
                  Types.UserScopedToAccountList,
                  'id' | 'firstName' | 'lastName'
                >
              >;
            }
        >;
      };
    };
};

export const TaskModalCommentFragmentDoc = gql`
  fragment TaskModalComment on Comment {
    id
    body
    updatedAt
    me
    person {
      id
      firstName
      lastName
    }
  }
`;
export const GetCommentsForTaskModalCommentListDocument = gql`
  query GetCommentsForTaskModalCommentList($accountListId: ID!, $taskId: ID!) {
    task(accountListId: $accountListId, id: $taskId) {
      id
      comments(first: 25) {
        nodes {
          ...TaskModalComment
        }
      }
    }
  }
  ${TaskModalCommentFragmentDoc}
`;
export function useGetCommentsForTaskModalCommentListQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetCommentsForTaskModalCommentListQuery,
    GetCommentsForTaskModalCommentListQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetCommentsForTaskModalCommentListQuery,
    GetCommentsForTaskModalCommentListQueryVariables
  >(GetCommentsForTaskModalCommentListDocument, options);
}
export function useGetCommentsForTaskModalCommentListLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetCommentsForTaskModalCommentListQuery,
    GetCommentsForTaskModalCommentListQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetCommentsForTaskModalCommentListQuery,
    GetCommentsForTaskModalCommentListQueryVariables
  >(GetCommentsForTaskModalCommentListDocument, options);
}
export type GetCommentsForTaskModalCommentListQueryHookResult = ReturnType<
  typeof useGetCommentsForTaskModalCommentListQuery
>;
export type GetCommentsForTaskModalCommentListLazyQueryHookResult = ReturnType<
  typeof useGetCommentsForTaskModalCommentListLazyQuery
>;
export type GetCommentsForTaskModalCommentListQueryResult = Apollo.QueryResult<
  GetCommentsForTaskModalCommentListQuery,
  GetCommentsForTaskModalCommentListQueryVariables
>;
