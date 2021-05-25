import { MuiThemeProvider } from '@material-ui/core';
import React, { ReactElement } from 'react';
import {
  gqlMock,
  GqlMockedProvider,
} from '../../../../../__tests__/util/graphqlMocking';
import theme from '../../../../theme';
import { GetCoachingAnswerSetsQuery } from '../GetCoachingAnswerSets.generated';
import CoachingQuestionsModal from './CoachingQuestionsModal';

export default {
  title: 'Coaching/CoachingQuestionsModal',
};

const accountListId = 'abc';

export const Null = (): ReactElement => {
  const mock: GetCoachingAnswerSetsQuery = {
    coachingAnswerSets: [{ id: '1', answers: [], questions: [] }],
  };

  return (
    <GqlMockedProvider<GetCoachingAnswerSetsQuery> mocks={{ mock }}>
      <MuiThemeProvider theme={theme}>
        <CoachingQuestionsModal accountListId={accountListId} />
      </MuiThemeProvider>
    </GqlMockedProvider>
  );
};

export const ShortAnswer = (): ReactElement => {
  const mock: GetCoachingAnswerSetsQuery = {
    coachingAnswerSets: [{ questions: [{ responseOptions: null }] }],
  };

  return (
    <GqlMockedProvider<GetCoachingAnswerSetsQuery> mocks={{ mock }}>
      <CoachingQuestionsModal accountListId={accountListId} />
    </GqlMockedProvider>
  );
};

export const ResponseOptions = (): ReactElement => {
  const mock: GetCoachingAnswerSetsQuery = {
    coachingAnswerSets: [
      { questions: [{ responseOptions: ['option 1', 'option 2'] }] },
    ],
  };

  return (
    <GqlMockedProvider<GetCoachingAnswerSetsQuery> mocks={{ mock }}>
      <CoachingQuestionsModal accountListId={accountListId} />
    </GqlMockedProvider>
  );
};
