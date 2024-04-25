import * as Types from '../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetWeeklyActivityQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  startOfWeek: Types.Scalars['ISO8601DateTime']['input'];
  endOfWeek: Types.Scalars['ISO8601DateTime']['input'];
}>;


export type GetWeeklyActivityQuery = (
  { __typename?: 'Query' }
  & { completedCalls: (
    { __typename?: 'TaskConnection' }
    & Pick<Types.TaskConnection, 'totalCount'>
  ), callsThatProducedAppointments: (
    { __typename?: 'TaskConnection' }
    & Pick<Types.TaskConnection, 'totalCount'>
  ), completedMessages: (
    { __typename?: 'TaskConnection' }
    & Pick<Types.TaskConnection, 'totalCount'>
  ), messagesThatProducedAppointments: (
    { __typename?: 'TaskConnection' }
    & Pick<Types.TaskConnection, 'totalCount'>
  ), completedAppointments: (
    { __typename?: 'TaskConnection' }
    & Pick<Types.TaskConnection, 'totalCount'>
  ), completedCorrespondence: (
    { __typename?: 'TaskConnection' }
    & Pick<Types.TaskConnection, 'totalCount'>
  ) }
);


export const GetWeeklyActivityDocument = gql`
    query GetWeeklyActivity($accountListId: ID!, $startOfWeek: ISO8601DateTime!, $endOfWeek: ISO8601DateTime!) {
  completedCalls: tasks(
    accountListId: $accountListId
    tasksFilter: {completedAt: {min: $startOfWeek, max: $endOfWeek}, activityType: CALL, result: [COMPLETED, DONE]}
  ) {
    totalCount
  }
  callsThatProducedAppointments: tasks(
    accountListId: $accountListId
    tasksFilter: {completedAt: {min: $startOfWeek, max: $endOfWeek}, activityType: CALL, result: [COMPLETED, DONE], nextAction: APPOINTMENT}
  ) {
    totalCount
  }
  completedMessages: tasks(
    accountListId: $accountListId
    tasksFilter: {completedAt: {min: $startOfWeek, max: $endOfWeek}, activityType: [EMAIL, FACEBOOK_MESSAGE, TEXT_MESSAGE], result: [COMPLETED, DONE]}
  ) {
    totalCount
  }
  messagesThatProducedAppointments: tasks(
    accountListId: $accountListId
    tasksFilter: {completedAt: {min: $startOfWeek, max: $endOfWeek}, activityType: [EMAIL, FACEBOOK_MESSAGE, TEXT_MESSAGE], result: [COMPLETED, DONE], nextAction: APPOINTMENT}
  ) {
    totalCount
  }
  completedAppointments: tasks(
    accountListId: $accountListId
    tasksFilter: {completedAt: {min: $startOfWeek, max: $endOfWeek}, activityType: APPOINTMENT, result: [COMPLETED, DONE]}
  ) {
    totalCount
  }
  completedCorrespondence: tasks(
    accountListId: $accountListId
    tasksFilter: {completedAt: {min: $startOfWeek, max: $endOfWeek}, activityType: [PRE_CALL_LETTER, REMINDER_LETTER, SUPPORT_LETTER, THANK], result: [COMPLETED, DONE]}
  ) {
    totalCount
  }
}
    `;
export function useGetWeeklyActivityQuery(baseOptions: Apollo.QueryHookOptions<GetWeeklyActivityQuery, GetWeeklyActivityQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetWeeklyActivityQuery, GetWeeklyActivityQueryVariables>(GetWeeklyActivityDocument, options);
      }
export function useGetWeeklyActivityLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetWeeklyActivityQuery, GetWeeklyActivityQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetWeeklyActivityQuery, GetWeeklyActivityQueryVariables>(GetWeeklyActivityDocument, options);
        }
export type GetWeeklyActivityQueryHookResult = ReturnType<typeof useGetWeeklyActivityQuery>;
export type GetWeeklyActivityLazyQueryHookResult = ReturnType<typeof useGetWeeklyActivityLazyQuery>;
export type GetWeeklyActivityQueryResult = Apollo.QueryResult<GetWeeklyActivityQuery, GetWeeklyActivityQueryVariables>;