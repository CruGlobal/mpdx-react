import { MuiThemeProvider } from '@material-ui/core';
import React, { ReactElement } from 'react';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import theme from '../../../../theme';
import { GetCoachingAnswerSetsQuery } from '../GetCoachingAnswerSets.generated';
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

export const ShortAnswer = (): ReactElement => {
  return (
    <GqlMockedProvider<GetCoachingAnswerSetsQuery>
      mocks={{
        GetCoachingAnswerSets: {
          coachingAnswerSets: [
            {
              questions: [
                { responseOptions: null },
                { responseOptions: null },
                { responseOptions: null },
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
          questions: [
            {
              responseOptions: ['option 1', 'option 2', 'option 3', 'option 4'],
            },
            {
              responseOptions: ['option 1', 'option 2', 'option 3', 'option 4'],
            },
            {
              responseOptions: ['option 1', 'option 2', 'option 3', 'option 4'],
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
