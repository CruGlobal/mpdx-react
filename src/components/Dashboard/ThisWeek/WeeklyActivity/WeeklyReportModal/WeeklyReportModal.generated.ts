import * as Types from '../../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type WeeklyReportCoachingQuestionFragment = {
  __typename?: 'CoachingQuestion';
} & Pick<
  Types.CoachingQuestion,
  'id' | 'position' | 'prompt' | 'required' | 'responseOptions'
>;

export type AccountListOrganizationQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
}>;

export type AccountListOrganizationQuery = { __typename?: 'Query' } & {
  accountList: { __typename?: 'AccountList' } & Pick<
    Types.AccountList,
    'id' | 'salaryOrganizationId'
  >;
};

export type CurrentCoachingAnswerSetQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  organizationId: Types.Scalars['ID']['input'];
}>;

export type CurrentCoachingAnswerSetQuery = { __typename?: 'Query' } & {
  currentCoachingAnswerSet: { __typename?: 'CoachingAnswerSet' } & Pick<
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
              'id'
            >;
          }
      >;
      questions: Array<
        { __typename?: 'CoachingQuestion' } & Pick<
          Types.CoachingQuestion,
          'id' | 'position' | 'prompt' | 'required' | 'responseOptions'
        >
      >;
    };
};

export type SaveCoachingAnswerMutationVariables = Types.Exact<{
  answerSetId: Types.Scalars['String']['input'];
  answerId?: Types.InputMaybe<Types.Scalars['String']['input']>;
  response: Types.Scalars['String']['input'];
  questionId: Types.Scalars['String']['input'];
}>;

export type SaveCoachingAnswerMutation = { __typename?: 'Mutation' } & {
  saveCoachingAnswer: { __typename?: 'CoachingAnswer' } & Pick<
    Types.CoachingAnswer,
    'id' | 'response'
  > & {
      question: { __typename?: 'CoachingQuestion' } & Pick<
        Types.CoachingQuestion,
        'id' | 'position' | 'prompt' | 'required' | 'responseOptions'
      >;
    };
};

export const WeeklyReportCoachingQuestionFragmentDoc = gql`
  fragment WeeklyReportCoachingQuestion on CoachingQuestion {
    id
    position
    prompt
    required
    responseOptions
  }
`;
export const AccountListOrganizationDocument = gql`
  query AccountListOrganization($accountListId: ID!) {
    accountList(id: $accountListId) {
      id
      salaryOrganizationId
    }
  }
`;
export function useAccountListOrganizationQuery(
  baseOptions: Apollo.QueryHookOptions<
    AccountListOrganizationQuery,
    AccountListOrganizationQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    AccountListOrganizationQuery,
    AccountListOrganizationQueryVariables
  >(AccountListOrganizationDocument, options);
}
export function useAccountListOrganizationLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    AccountListOrganizationQuery,
    AccountListOrganizationQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    AccountListOrganizationQuery,
    AccountListOrganizationQueryVariables
  >(AccountListOrganizationDocument, options);
}
export type AccountListOrganizationQueryHookResult = ReturnType<
  typeof useAccountListOrganizationQuery
>;
export type AccountListOrganizationLazyQueryHookResult = ReturnType<
  typeof useAccountListOrganizationLazyQuery
>;
export type AccountListOrganizationQueryResult = Apollo.QueryResult<
  AccountListOrganizationQuery,
  AccountListOrganizationQueryVariables
>;
export const CurrentCoachingAnswerSetDocument = gql`
  query CurrentCoachingAnswerSet($accountListId: ID!, $organizationId: ID!) {
    currentCoachingAnswerSet(
      accountListId: $accountListId
      organizationId: $organizationId
    ) {
      id
      answers {
        id
        response
        question {
          id
        }
      }
      completedAt
      questions {
        ...WeeklyReportCoachingQuestion
      }
    }
  }
  ${WeeklyReportCoachingQuestionFragmentDoc}
`;
export function useCurrentCoachingAnswerSetQuery(
  baseOptions: Apollo.QueryHookOptions<
    CurrentCoachingAnswerSetQuery,
    CurrentCoachingAnswerSetQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    CurrentCoachingAnswerSetQuery,
    CurrentCoachingAnswerSetQueryVariables
  >(CurrentCoachingAnswerSetDocument, options);
}
export function useCurrentCoachingAnswerSetLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    CurrentCoachingAnswerSetQuery,
    CurrentCoachingAnswerSetQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    CurrentCoachingAnswerSetQuery,
    CurrentCoachingAnswerSetQueryVariables
  >(CurrentCoachingAnswerSetDocument, options);
}
export type CurrentCoachingAnswerSetQueryHookResult = ReturnType<
  typeof useCurrentCoachingAnswerSetQuery
>;
export type CurrentCoachingAnswerSetLazyQueryHookResult = ReturnType<
  typeof useCurrentCoachingAnswerSetLazyQuery
>;
export type CurrentCoachingAnswerSetQueryResult = Apollo.QueryResult<
  CurrentCoachingAnswerSetQuery,
  CurrentCoachingAnswerSetQueryVariables
>;
export const SaveCoachingAnswerDocument = gql`
  mutation SaveCoachingAnswer(
    $answerSetId: String!
    $answerId: String
    $response: String!
    $questionId: String!
  ) {
    saveCoachingAnswer(
      input: {
        answerSetId: $answerSetId
        answerId: $answerId
        response: $response
        questionId: $questionId
      }
    ) {
      id
      response
      question {
        ...WeeklyReportCoachingQuestion
      }
    }
  }
  ${WeeklyReportCoachingQuestionFragmentDoc}
`;
export type SaveCoachingAnswerMutationFn = Apollo.MutationFunction<
  SaveCoachingAnswerMutation,
  SaveCoachingAnswerMutationVariables
>;
export function useSaveCoachingAnswerMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SaveCoachingAnswerMutation,
    SaveCoachingAnswerMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SaveCoachingAnswerMutation,
    SaveCoachingAnswerMutationVariables
  >(SaveCoachingAnswerDocument, options);
}
export type SaveCoachingAnswerMutationHookResult = ReturnType<
  typeof useSaveCoachingAnswerMutation
>;
export type SaveCoachingAnswerMutationResult =
  Apollo.MutationResult<SaveCoachingAnswerMutation>;
export type SaveCoachingAnswerMutationOptions = Apollo.BaseMutationOptions<
  SaveCoachingAnswerMutation,
  SaveCoachingAnswerMutationVariables
>;
