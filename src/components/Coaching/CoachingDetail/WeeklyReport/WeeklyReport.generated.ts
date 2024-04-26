import * as Types from '../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type WeeklyReportsQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
}>;

export type WeeklyReportsQuery = { __typename?: 'Query' } & {
  coachingAnswerSets: Array<
    { __typename?: 'CoachingAnswerSet' } & Pick<
      Types.CoachingAnswerSet,
      'id' | 'completedAt'
    > & {
        answers: Array<
          { __typename?: 'CoachingAnswer' } & Pick<
            Types.CoachingAnswer,
            'id' | 'response'
          > & {
              question: { __typename?: 'CoachingQuestion' } & Pick<
                Types.CoachingQuestion,
                'id' | 'position' | 'prompt'
              >;
            }
        >;
      }
  >;
};

export const WeeklyReportsDocument = gql`
  query WeeklyReports($accountListId: ID!) {
    coachingAnswerSets(accountListId: $accountListId, completed: true) {
      id
      answers {
        id
        response
        question {
          id
          position
          prompt
        }
      }
      completedAt
    }
  }
`;
export function useWeeklyReportsQuery(
  baseOptions: Apollo.QueryHookOptions<
    WeeklyReportsQuery,
    WeeklyReportsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<WeeklyReportsQuery, WeeklyReportsQueryVariables>(
    WeeklyReportsDocument,
    options,
  );
}
export function useWeeklyReportsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    WeeklyReportsQuery,
    WeeklyReportsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<WeeklyReportsQuery, WeeklyReportsQueryVariables>(
    WeeklyReportsDocument,
    options,
  );
}
export type WeeklyReportsQueryHookResult = ReturnType<
  typeof useWeeklyReportsQuery
>;
export type WeeklyReportsLazyQueryHookResult = ReturnType<
  typeof useWeeklyReportsLazyQuery
>;
export type WeeklyReportsQueryResult = Apollo.QueryResult<
  WeeklyReportsQuery,
  WeeklyReportsQueryVariables
>;
