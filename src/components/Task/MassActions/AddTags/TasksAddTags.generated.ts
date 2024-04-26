import * as Types from '../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type TasksAddTagsMutationVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  attributes: Array<Types.TaskUpdateInput> | Types.TaskUpdateInput;
}>;

export type TasksAddTagsMutation = { __typename?: 'Mutation' } & {
  updateTasks?: Types.Maybe<
    { __typename?: 'TasksUpdateMutationPayload' } & {
      tasks: Array<{ __typename?: 'Task' } & Pick<Types.Task, 'id'>>;
    }
  >;
};

export type GetTasksForAddingTagsQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  taskIds: Array<Types.Scalars['ID']['input']> | Types.Scalars['ID']['input'];
  numTaskIds: Types.Scalars['Int']['input'];
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;

export type GetTasksForAddingTagsQuery = { __typename?: 'Query' } & {
  tasks: { __typename?: 'TaskConnection' } & {
    nodes: Array<{ __typename?: 'Task' } & Pick<Types.Task, 'id' | 'tagList'>>;
    pageInfo: { __typename?: 'PageInfo' } & Pick<
      Types.PageInfo,
      'endCursor' | 'hasNextPage'
    >;
  };
};

export type GetTaskTagListQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
}>;

export type GetTaskTagListQuery = { __typename?: 'Query' } & {
  accountList: { __typename?: 'AccountList' } & Pick<
    Types.AccountList,
    'id' | 'taskTagList'
  >;
};

export const TasksAddTagsDocument = gql`
  mutation TasksAddTags($accountListId: ID!, $attributes: [TaskUpdateInput!]!) {
    updateTasks(
      input: { accountListId: $accountListId, attributes: $attributes }
    ) {
      tasks {
        id
      }
    }
  }
`;
export type TasksAddTagsMutationFn = Apollo.MutationFunction<
  TasksAddTagsMutation,
  TasksAddTagsMutationVariables
>;
export function useTasksAddTagsMutation(
  baseOptions?: Apollo.MutationHookOptions<
    TasksAddTagsMutation,
    TasksAddTagsMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    TasksAddTagsMutation,
    TasksAddTagsMutationVariables
  >(TasksAddTagsDocument, options);
}
export type TasksAddTagsMutationHookResult = ReturnType<
  typeof useTasksAddTagsMutation
>;
export type TasksAddTagsMutationResult =
  Apollo.MutationResult<TasksAddTagsMutation>;
export type TasksAddTagsMutationOptions = Apollo.BaseMutationOptions<
  TasksAddTagsMutation,
  TasksAddTagsMutationVariables
>;
export const GetTasksForAddingTagsDocument = gql`
  query GetTasksForAddingTags(
    $accountListId: ID!
    $taskIds: [ID!]!
    $numTaskIds: Int!
    $after: String
  ) {
    tasks(
      accountListId: $accountListId
      tasksFilter: { ids: $taskIds }
      first: $numTaskIds
      after: $after
    ) {
      nodes {
        id
        tagList
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;
export function useGetTasksForAddingTagsQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetTasksForAddingTagsQuery,
    GetTasksForAddingTagsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetTasksForAddingTagsQuery,
    GetTasksForAddingTagsQueryVariables
  >(GetTasksForAddingTagsDocument, options);
}
export function useGetTasksForAddingTagsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetTasksForAddingTagsQuery,
    GetTasksForAddingTagsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetTasksForAddingTagsQuery,
    GetTasksForAddingTagsQueryVariables
  >(GetTasksForAddingTagsDocument, options);
}
export type GetTasksForAddingTagsQueryHookResult = ReturnType<
  typeof useGetTasksForAddingTagsQuery
>;
export type GetTasksForAddingTagsLazyQueryHookResult = ReturnType<
  typeof useGetTasksForAddingTagsLazyQuery
>;
export type GetTasksForAddingTagsQueryResult = Apollo.QueryResult<
  GetTasksForAddingTagsQuery,
  GetTasksForAddingTagsQueryVariables
>;
export const GetTaskTagListDocument = gql`
  query GetTaskTagList($accountListId: ID!) {
    accountList(id: $accountListId) {
      id
      taskTagList
    }
  }
`;
export function useGetTaskTagListQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetTaskTagListQuery,
    GetTaskTagListQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetTaskTagListQuery, GetTaskTagListQueryVariables>(
    GetTaskTagListDocument,
    options,
  );
}
export function useGetTaskTagListLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetTaskTagListQuery,
    GetTaskTagListQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetTaskTagListQuery, GetTaskTagListQueryVariables>(
    GetTaskTagListDocument,
    options,
  );
}
export type GetTaskTagListQueryHookResult = ReturnType<
  typeof useGetTaskTagListQuery
>;
export type GetTaskTagListLazyQueryHookResult = ReturnType<
  typeof useGetTaskTagListLazyQuery
>;
export type GetTaskTagListQueryResult = Apollo.QueryResult<
  GetTaskTagListQuery,
  GetTaskTagListQueryVariables
>;
