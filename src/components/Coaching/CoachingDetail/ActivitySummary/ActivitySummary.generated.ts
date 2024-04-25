import * as Types from '../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ActivitySummaryQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  range: Types.Scalars['String']['input'];
}>;


export type ActivitySummaryQuery = (
  { __typename?: 'Query' }
  & { reportsActivityResults: (
    { __typename?: 'ActivityResults' }
    & { periods: Array<(
      { __typename?: 'ActivityResultsPeriod' }
      & Pick<Types.ActivityResultsPeriod, 'callsWithAppointmentNext' | 'completedCall' | 'completedPreCallLetter' | 'completedReminderLetter' | 'completedSupportLetter' | 'completedThank' | 'dials' | 'electronicMessageSent' | 'electronicMessageWithAppointmentNext' | 'startDate'>
    )> }
  ) }
);


export const ActivitySummaryDocument = gql`
    query ActivitySummary($accountListId: ID!, $range: String!) {
  reportsActivityResults(accountListId: $accountListId, range: $range) {
    periods {
      callsWithAppointmentNext
      completedCall
      completedPreCallLetter
      completedReminderLetter
      completedSupportLetter
      completedThank
      dials
      electronicMessageSent
      electronicMessageWithAppointmentNext
      startDate
    }
  }
}
    `;
export function useActivitySummaryQuery(baseOptions: Apollo.QueryHookOptions<ActivitySummaryQuery, ActivitySummaryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ActivitySummaryQuery, ActivitySummaryQueryVariables>(ActivitySummaryDocument, options);
      }
export function useActivitySummaryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ActivitySummaryQuery, ActivitySummaryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ActivitySummaryQuery, ActivitySummaryQueryVariables>(ActivitySummaryDocument, options);
        }
export type ActivitySummaryQueryHookResult = ReturnType<typeof useActivitySummaryQuery>;
export type ActivitySummaryLazyQueryHookResult = ReturnType<typeof useActivitySummaryLazyQuery>;
export type ActivitySummaryQueryResult = Apollo.QueryResult<ActivitySummaryQuery, ActivitySummaryQueryVariables>;