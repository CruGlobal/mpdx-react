import * as Types from '../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetTaskForTaskModalQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  taskId: Types.Scalars['ID']['input'];
  includeComments: Types.Scalars['Boolean']['input'];
}>;

export type GetTaskForTaskModalQuery = { __typename?: 'Query' } & {
  task: { __typename?: 'Task' } & Pick<
    Types.Task,
    | 'id'
    | 'taskPhase'
    | 'activityType'
    | 'subject'
    | 'location'
    | 'startAt'
    | 'completedAt'
    | 'result'
    | 'nextAction'
    | 'tagList'
    | 'notificationTimeBefore'
    | 'notificationType'
    | 'notificationTimeUnit'
  > & {
      contacts: { __typename?: 'ContactConnection' } & {
        nodes: Array<
          { __typename?: 'Contact' } & Pick<
            Types.Contact,
            'id' | 'name' | 'status'
          >
        >;
      };
      comments?: { __typename?: 'CommentConnection' } & Pick<
        Types.CommentConnection,
        'totalCount'
      >;
      user?: Types.Maybe<
        { __typename?: 'UserScopedToAccountList' } & Pick<
          Types.UserScopedToAccountList,
          'id' | 'firstName' | 'lastName'
        >
      >;
    };
};

export const GetTaskForTaskModalDocument = gql`
  query GetTaskForTaskModal(
    $accountListId: ID!
    $taskId: ID!
    $includeComments: Boolean!
  ) {
    task(accountListId: $accountListId, id: $taskId) {
      id
      taskPhase
      activityType
      subject
      location
      startAt
      completedAt
      result
      nextAction
      tagList
      contacts(first: 25) {
        nodes {
          id
          name
          status
        }
      }
      comments @include(if: $includeComments) {
        totalCount
      }
      user {
        id
        firstName
        lastName
      }
      notificationTimeBefore
      notificationType
      notificationTimeUnit
    }
  }
`;
export function useGetTaskForTaskModalQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetTaskForTaskModalQuery,
    GetTaskForTaskModalQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetTaskForTaskModalQuery,
    GetTaskForTaskModalQueryVariables
  >(GetTaskForTaskModalDocument, options);
}
export function useGetTaskForTaskModalLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetTaskForTaskModalQuery,
    GetTaskForTaskModalQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetTaskForTaskModalQuery,
    GetTaskForTaskModalQueryVariables
  >(GetTaskForTaskModalDocument, options);
}
export type GetTaskForTaskModalQueryHookResult = ReturnType<
  typeof useGetTaskForTaskModalQuery
>;
export type GetTaskForTaskModalLazyQueryHookResult = ReturnType<
  typeof useGetTaskForTaskModalLazyQuery
>;
export type GetTaskForTaskModalQueryResult = Apollo.QueryResult<
  GetTaskForTaskModalQuery,
  GetTaskForTaskModalQueryVariables
>;
