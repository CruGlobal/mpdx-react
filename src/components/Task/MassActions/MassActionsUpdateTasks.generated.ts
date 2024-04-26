import * as Types from '../../../graphql/types.generated';

import { gql } from '@apollo/client';
import { TaskRowFragmentDoc } from '../TaskRow/TaskRow.generated';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type MassActionsUpdateTasksMutationVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  attributes: Array<Types.TaskUpdateInput> | Types.TaskUpdateInput;
}>;

export type MassActionsUpdateTasksMutation = { __typename?: 'Mutation' } & {
  updateTasks?: Types.Maybe<
    { __typename?: 'TasksUpdateMutationPayload' } & {
      tasks: Array<
        { __typename?: 'Task' } & Pick<
          Types.Task,
          | 'id'
          | 'activityType'
          | 'startAt'
          | 'completedAt'
          | 'result'
          | 'starred'
          | 'subject'
          | 'tagList'
        > & {
            comments: { __typename?: 'CommentConnection' } & Pick<
              Types.CommentConnection,
              'totalCount'
            >;
            contacts: { __typename?: 'ContactConnection' } & {
              nodes: Array<
                { __typename?: 'Contact' } & Pick<Types.Contact, 'id' | 'name'>
              >;
            };
            user?: Types.Maybe<
              { __typename?: 'UserScopedToAccountList' } & Pick<
                Types.UserScopedToAccountList,
                'id' | 'firstName' | 'lastName'
              >
            >;
          }
      >;
    }
  >;
};

export type MassActionsDeleteTasksMutationVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  ids:
    | Array<Types.Scalars['String']['input']>
    | Types.Scalars['String']['input'];
}>;

export type MassActionsDeleteTasksMutation = { __typename?: 'Mutation' } & {
  deleteTasks?: Types.Maybe<
    { __typename?: 'TasksDeleteMutationPayload' } & Pick<
      Types.TasksDeleteMutationPayload,
      'ids'
    >
  >;
};

export const MassActionsUpdateTasksDocument = gql`
  mutation MassActionsUpdateTasks(
    $accountListId: ID!
    $attributes: [TaskUpdateInput!]!
  ) {
    updateTasks(
      input: { accountListId: $accountListId, attributes: $attributes }
    ) {
      tasks {
        ...TaskRow
      }
    }
  }
  ${TaskRowFragmentDoc}
`;
export type MassActionsUpdateTasksMutationFn = Apollo.MutationFunction<
  MassActionsUpdateTasksMutation,
  MassActionsUpdateTasksMutationVariables
>;
export function useMassActionsUpdateTasksMutation(
  baseOptions?: Apollo.MutationHookOptions<
    MassActionsUpdateTasksMutation,
    MassActionsUpdateTasksMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    MassActionsUpdateTasksMutation,
    MassActionsUpdateTasksMutationVariables
  >(MassActionsUpdateTasksDocument, options);
}
export type MassActionsUpdateTasksMutationHookResult = ReturnType<
  typeof useMassActionsUpdateTasksMutation
>;
export type MassActionsUpdateTasksMutationResult =
  Apollo.MutationResult<MassActionsUpdateTasksMutation>;
export type MassActionsUpdateTasksMutationOptions = Apollo.BaseMutationOptions<
  MassActionsUpdateTasksMutation,
  MassActionsUpdateTasksMutationVariables
>;
export const MassActionsDeleteTasksDocument = gql`
  mutation MassActionsDeleteTasks($accountListId: ID!, $ids: [String!]!) {
    deleteTasks(input: { accountListId: $accountListId, ids: $ids }) {
      ids
    }
  }
`;
export type MassActionsDeleteTasksMutationFn = Apollo.MutationFunction<
  MassActionsDeleteTasksMutation,
  MassActionsDeleteTasksMutationVariables
>;
export function useMassActionsDeleteTasksMutation(
  baseOptions?: Apollo.MutationHookOptions<
    MassActionsDeleteTasksMutation,
    MassActionsDeleteTasksMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    MassActionsDeleteTasksMutation,
    MassActionsDeleteTasksMutationVariables
  >(MassActionsDeleteTasksDocument, options);
}
export type MassActionsDeleteTasksMutationHookResult = ReturnType<
  typeof useMassActionsDeleteTasksMutation
>;
export type MassActionsDeleteTasksMutationResult =
  Apollo.MutationResult<MassActionsDeleteTasksMutation>;
export type MassActionsDeleteTasksMutationOptions = Apollo.BaseMutationOptions<
  MassActionsDeleteTasksMutation,
  MassActionsDeleteTasksMutationVariables
>;
