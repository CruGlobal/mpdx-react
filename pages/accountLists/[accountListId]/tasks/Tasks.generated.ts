import * as Types from '../../../../src/graphql/types.generated';

import { gql } from '@apollo/client';
import { TaskRowFragmentDoc } from '../../../../src/components/Task/TaskRow/TaskRow.generated';
import {
  FilterPanelGroupFragmentDoc,
  UserOptionFragmentDoc,
} from '../../../../src/components/Shared/Filters/FilterPanel.generated';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type TasksQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  tasksFilter?: Types.InputMaybe<Types.TaskFilterSetInput>;
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;

export type TasksQuery = { __typename?: 'Query' } & {
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
  allTasks: { __typename?: 'TaskConnection' } & Pick<
    Types.TaskConnection,
    'totalCount'
  >;
};

export type TaskFiltersQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
}>;

export type TaskFiltersQuery = { __typename?: 'Query' } & {
  accountList: { __typename?: 'AccountList' } & Pick<
    Types.AccountList,
    'id'
  > & {
      taskFilterGroups: Array<
        { __typename?: 'FilterGroup' } & Pick<
          Types.FilterGroup,
          'name' | 'featured'
        > & {
            filters: Array<
              | ({ __typename: 'CheckboxFilter' } & Pick<
                  Types.CheckboxFilter,
                  'filterKey' | 'title'
                >)
              | ({ __typename: 'DaterangeFilter' } & Pick<
                  Types.DaterangeFilter,
                  'filterKey' | 'title'
                > & {
                    options?: Types.Maybe<
                      Array<
                        { __typename?: 'DateRangeOption' } & Pick<
                          Types.DateRangeOption,
                          'name' | 'rangeEnd' | 'rangeStart'
                        >
                      >
                    >;
                  })
              | ({ __typename: 'MultiselectFilter' } & Pick<
                  Types.MultiselectFilter,
                  'defaultSelection' | 'filterKey' | 'title'
                > & {
                    options?: Types.Maybe<
                      Array<
                        { __typename?: 'FilterOption' } & Pick<
                          Types.FilterOption,
                          'name' | 'placeholder' | 'value'
                        >
                      >
                    >;
                  })
              | ({ __typename: 'NumericRangeFilter' } & Pick<
                  Types.NumericRangeFilter,
                  | 'min'
                  | 'minLabel'
                  | 'max'
                  | 'maxLabel'
                  | 'title'
                  | 'filterKey'
                >)
              | ({ __typename: 'RadioFilter' } & Pick<
                  Types.RadioFilter,
                  'defaultSelection' | 'filterKey' | 'title'
                > & {
                    options?: Types.Maybe<
                      Array<
                        { __typename?: 'FilterOption' } & Pick<
                          Types.FilterOption,
                          'name' | 'placeholder' | 'value'
                        >
                      >
                    >;
                  })
              | ({ __typename: 'TextFilter' } & Pick<
                  Types.TextFilter,
                  'filterKey' | 'title'
                > & {
                    options?: Types.Maybe<
                      Array<
                        { __typename?: 'FilterOption' } & Pick<
                          Types.FilterOption,
                          'name' | 'placeholder' | 'value'
                        >
                      >
                    >;
                  })
            >;
          }
      >;
    };
  userOptions: Array<
    { __typename?: 'Option' } & Pick<Types.Option, 'id' | 'key' | 'value'>
  >;
};

export const TasksDocument = gql`
  query Tasks(
    $accountListId: ID!
    $tasksFilter: TaskFilterSetInput
    $after: String
  ) {
    tasks(
      accountListId: $accountListId
      tasksFilter: $tasksFilter
      after: $after
    ) {
      nodes {
        ...TaskRow
      }
      totalCount
      pageInfo {
        endCursor
        hasNextPage
      }
    }
    allTasks: tasks(accountListId: $accountListId) {
      totalCount
    }
  }
  ${TaskRowFragmentDoc}
`;
export function useTasksQuery(
  baseOptions: Apollo.QueryHookOptions<TasksQuery, TasksQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<TasksQuery, TasksQueryVariables>(
    TasksDocument,
    options,
  );
}
export function useTasksLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<TasksQuery, TasksQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<TasksQuery, TasksQueryVariables>(
    TasksDocument,
    options,
  );
}
export type TasksQueryHookResult = ReturnType<typeof useTasksQuery>;
export type TasksLazyQueryHookResult = ReturnType<typeof useTasksLazyQuery>;
export type TasksQueryResult = Apollo.QueryResult<
  TasksQuery,
  TasksQueryVariables
>;
export const TaskFiltersDocument = gql`
  query TaskFilters($accountListId: ID!) {
    accountList(id: $accountListId) {
      id
      taskFilterGroups {
        ...FilterPanelGroup
      }
    }
    userOptions {
      ...UserOption
    }
  }
  ${FilterPanelGroupFragmentDoc}
  ${UserOptionFragmentDoc}
`;
export function useTaskFiltersQuery(
  baseOptions: Apollo.QueryHookOptions<
    TaskFiltersQuery,
    TaskFiltersQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<TaskFiltersQuery, TaskFiltersQueryVariables>(
    TaskFiltersDocument,
    options,
  );
}
export function useTaskFiltersLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    TaskFiltersQuery,
    TaskFiltersQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<TaskFiltersQuery, TaskFiltersQueryVariables>(
    TaskFiltersDocument,
    options,
  );
}
export type TaskFiltersQueryHookResult = ReturnType<typeof useTaskFiltersQuery>;
export type TaskFiltersLazyQueryHookResult = ReturnType<
  typeof useTaskFiltersLazyQuery
>;
export type TaskFiltersQueryResult = Apollo.QueryResult<
  TaskFiltersQuery,
  TaskFiltersQueryVariables
>;
