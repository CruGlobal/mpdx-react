import * as Types from '../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import { TaskRowFragmentDoc } from '../../TaskRow/TaskRow.generated';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type CreateTasksMutationVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  attributes: Types.TaskCreateInput;
}>;


export type CreateTasksMutation = (
  { __typename?: 'Mutation' }
  & { createTasks?: Types.Maybe<(
    { __typename?: 'TasksCreateMutationPayload' }
    & { tasks: Array<(
      { __typename?: 'Task' }
      & Pick<Types.Task, 'id' | 'activityType' | 'startAt' | 'completedAt' | 'result' | 'starred' | 'subject' | 'tagList'>
      & { comments: (
        { __typename?: 'CommentConnection' }
        & Pick<Types.CommentConnection, 'totalCount'>
      ), contacts: (
        { __typename?: 'ContactConnection' }
        & { nodes: Array<(
          { __typename?: 'Contact' }
          & Pick<Types.Contact, 'id' | 'name'>
        )> }
      ), user?: Types.Maybe<(
        { __typename?: 'UserScopedToAccountList' }
        & Pick<Types.UserScopedToAccountList, 'id' | 'firstName' | 'lastName'>
      )> }
    )> }
  )> }
);

export type UpdateTaskMutationVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  attributes: Types.TaskUpdateInput;
}>;


export type UpdateTaskMutation = (
  { __typename?: 'Mutation' }
  & { updateTask?: Types.Maybe<(
    { __typename?: 'TaskUpdateMutationPayload' }
    & { task: (
      { __typename?: 'Task' }
      & Pick<Types.Task, 'id' | 'activityType' | 'startAt' | 'completedAt' | 'result' | 'starred' | 'subject' | 'tagList'>
      & { comments: (
        { __typename?: 'CommentConnection' }
        & Pick<Types.CommentConnection, 'totalCount'>
      ), contacts: (
        { __typename?: 'ContactConnection' }
        & { nodes: Array<(
          { __typename?: 'Contact' }
          & Pick<Types.Contact, 'id' | 'name'>
        )> }
      ), user?: Types.Maybe<(
        { __typename?: 'UserScopedToAccountList' }
        & Pick<Types.UserScopedToAccountList, 'id' | 'firstName' | 'lastName'>
      )> }
    ) }
  )> }
);

export type DeleteTaskMutationVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  id: Types.Scalars['ID']['input'];
}>;


export type DeleteTaskMutation = (
  { __typename?: 'Mutation' }
  & { deleteTask?: Types.Maybe<(
    { __typename?: 'TaskDeleteMutationPayload' }
    & Pick<Types.TaskDeleteMutationPayload, 'id'>
  )> }
);


export const CreateTasksDocument = gql`
    mutation CreateTasks($accountListId: ID!, $attributes: TaskCreateInput!) {
  createTasks(input: {accountListId: $accountListId, attributes: $attributes}) {
    tasks {
      ...TaskRow
    }
  }
}
    ${TaskRowFragmentDoc}`;
export type CreateTasksMutationFn = Apollo.MutationFunction<CreateTasksMutation, CreateTasksMutationVariables>;
export function useCreateTasksMutation(baseOptions?: Apollo.MutationHookOptions<CreateTasksMutation, CreateTasksMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateTasksMutation, CreateTasksMutationVariables>(CreateTasksDocument, options);
      }
export type CreateTasksMutationHookResult = ReturnType<typeof useCreateTasksMutation>;
export type CreateTasksMutationResult = Apollo.MutationResult<CreateTasksMutation>;
export type CreateTasksMutationOptions = Apollo.BaseMutationOptions<CreateTasksMutation, CreateTasksMutationVariables>;
export const UpdateTaskDocument = gql`
    mutation UpdateTask($accountListId: ID!, $attributes: TaskUpdateInput!) {
  updateTask(input: {accountListId: $accountListId, attributes: $attributes}) {
    task {
      ...TaskRow
    }
  }
}
    ${TaskRowFragmentDoc}`;
export type UpdateTaskMutationFn = Apollo.MutationFunction<UpdateTaskMutation, UpdateTaskMutationVariables>;
export function useUpdateTaskMutation(baseOptions?: Apollo.MutationHookOptions<UpdateTaskMutation, UpdateTaskMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateTaskMutation, UpdateTaskMutationVariables>(UpdateTaskDocument, options);
      }
export type UpdateTaskMutationHookResult = ReturnType<typeof useUpdateTaskMutation>;
export type UpdateTaskMutationResult = Apollo.MutationResult<UpdateTaskMutation>;
export type UpdateTaskMutationOptions = Apollo.BaseMutationOptions<UpdateTaskMutation, UpdateTaskMutationVariables>;
export const DeleteTaskDocument = gql`
    mutation DeleteTask($accountListId: ID!, $id: ID!) {
  deleteTask(input: {accountListId: $accountListId, id: $id}) {
    id
  }
}
    `;
export type DeleteTaskMutationFn = Apollo.MutationFunction<DeleteTaskMutation, DeleteTaskMutationVariables>;
export function useDeleteTaskMutation(baseOptions?: Apollo.MutationHookOptions<DeleteTaskMutation, DeleteTaskMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteTaskMutation, DeleteTaskMutationVariables>(DeleteTaskDocument, options);
      }
export type DeleteTaskMutationHookResult = ReturnType<typeof useDeleteTaskMutation>;
export type DeleteTaskMutationResult = Apollo.MutationResult<DeleteTaskMutation>;
export type DeleteTaskMutationOptions = Apollo.BaseMutationOptions<DeleteTaskMutation, DeleteTaskMutationVariables>;