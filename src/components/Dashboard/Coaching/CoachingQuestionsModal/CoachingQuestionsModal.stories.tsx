import { MockedProvider } from '@apollo/client/testing';
import { MuiThemeProvider } from '@material-ui/core';
import React, { ReactElement } from 'react';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import theme from '../../../../theme';
import {
  GetCoachingAnswerSetsDocument,
  GetCoachingAnswerSetsQuery,
} from '../GetCoachingAnswerSets.generated';
import CoachingQuestionsModal from './CoachingQuestionsModal';

export default {
  title: 'Coaching/CoachingQuestionsModal',
};

const accountListId = 'abc';

export const Null = (): ReactElement => {
  return (
    <GqlMockedProvider<GetCoachingAnswerSetsQuery>
      mocks={{
        GetCoachingAnswerSets: {
          coachingAnswerSets: [{ id: '1', questions: [] }],
        },
      }}
    >
      <MuiThemeProvider theme={theme}>
        <CoachingQuestionsModal
          accountListId={accountListId}
          isOpen={true}
          closeDrawer={() => {}}
        />
      </MuiThemeProvider>
    </GqlMockedProvider>
  );
};

export const Loading = (): ReactElement => {
  return (
    <MockedProvider
      mocks={[
        {
          request: {
            query: GetCoachingAnswerSetsDocument,
            variables: {
              accountListId: accountListId,
            },
          },
          result: {},
          delay: 8640000,
        },
      ]}
    >
      <MuiThemeProvider theme={theme}>
        <CoachingQuestionsModal
          accountListId={accountListId}
          isOpen={true}
          closeDrawer={() => {}}
        />
      </MuiThemeProvider>
    </MockedProvider>
  );
};

export const ShortAnswer = (): ReactElement => {
  return (
    <GqlMockedProvider<GetCoachingAnswerSetsQuery>
      mocks={{
        GetCoachingAnswerSets: {
          coachingAnswerSets: [
            {
              id: '1',
              questions: [
                { responseOptions: null, required: false },
                { responseOptions: null, required: false },
                { responseOptions: null, required: false },
              ],
            },
          ],
        },
      }}
    >
      <CoachingQuestionsModal
        accountListId={accountListId}
        isOpen={true}
        closeDrawer={() => {}}
      />
    </GqlMockedProvider>
  );
};

export const ResponseOptions = (): ReactElement => {
  const mock = {
    GetCoachingAnswerSets: {
      coachingAnswerSets: [
        {
          id: '1',
          questions: [
            {
              responseOptions: ['option 1', 'option 2', 'option 3', 'option 4'],
              required: false,
            },
            {
              responseOptions: ['option 1', 'option 2', 'option 3', 'option 4'],
              required: false,
            },
            {
              responseOptions: ['option 1', 'option 2', 'option 3', 'option 4'],
              required: false,
            },
          ],
        },
      ],
    },
  };

  return (
    <GqlMockedProvider<GetCoachingAnswerSetsQuery> mocks={mock}>
      <CoachingQuestionsModal
        accountListId={accountListId}
        isOpen={true}
        closeDrawer={() => {}}
      />
    </GqlMockedProvider>
  );
};

export const RequiredQuestion = (): ReactElement => {
  return (
    <GqlMockedProvider<GetCoachingAnswerSetsQuery>
      mocks={{
        GetCoachingAnswerSets: {
          coachingAnswerSets: [
            {
              id: '1',
              questions: [{ required: true, responseOptions: null }],
            },
          ],
        },
      }}
    >
      <CoachingQuestionsModal
        accountListId={accountListId}
        isOpen={true}
        closeDrawer={() => {}}
      />
    </GqlMockedProvider>
  );
};
