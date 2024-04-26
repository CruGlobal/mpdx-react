import * as Types from '../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import { TaskRowFragmentDoc } from '../../../Task/TaskRow/TaskRow.generated';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ContactTasksTabQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  tasksFilter?: Types.InputMaybe<Types.TaskFilterSetInput>;
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;

export type ContactTasksTabQuery = { __typename?: 'Query' } & {
  tasks: { __typename?: 'TaskConnection' } & Pick<
    Types.TaskConnection,
    'totalCount'
  > & {
      nodes: Array<
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
      pageInfo: { __typename?: 'PageInfo' } & Pick<
        Types.PageInfo,
        'endCursor' | 'hasNextPage'
      >;
    };
};

export const ContactTasksTabDocument = gql`
  query ContactTasksTab(
    $accountListId: ID!
    $tasksFilter: TaskFilterSetInput
    $after: String
  ) {
    tasks(
      accountListId: $accountListId
      tasksFilter: $tasksFilter
      first: 25
      after: $after
    ) {
      nodes {
        ...TaskRow
      }
      pageInfo {
        endCursor
        hasNextPage
      }
      totalCount
    }
  }
  ${TaskRowFragmentDoc}
`;
export function useContactTasksTabQuery(
  baseOptions: Apollo.QueryHookOptions<
    ContactTasksTabQuery,
    ContactTasksTabQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<ContactTasksTabQuery, ContactTasksTabQueryVariables>(
    ContactTasksTabDocument,
    options,
  );
}
export function useContactTasksTabLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    ContactTasksTabQuery,
    ContactTasksTabQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    ContactTasksTabQuery,
    ContactTasksTabQueryVariables
  >(ContactTasksTabDocument, options);
}
export type ContactTasksTabQueryHookResult = ReturnType<
  typeof useContactTasksTabQuery
>;
export type ContactTasksTabLazyQueryHookResult = ReturnType<
  typeof useContactTasksTabLazyQuery
>;
export type ContactTasksTabQueryResult = Apollo.QueryResult<
  ContactTasksTabQuery,
  ContactTasksTabQueryVariables
>;
