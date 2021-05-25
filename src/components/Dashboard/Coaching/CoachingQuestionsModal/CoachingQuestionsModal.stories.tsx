import { MuiThemeProvider } from '@material-ui/core';
import React, { ReactElement } from 'react';
import { CoachingAnswerSet } from '../../../../../graphql/types.generated';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import theme from '../../../../theme';
import { GetCoachingAnswerSetsQuery } from '../GetCoachingAnswerSets.generated';
import CoachingQuestionsModal from './CoachingQuestionsModal';

export default {
  title: 'Coaching/CoachingQuestionsModal',
};

const accountListId = '111';

export const Loading = (): ReactElement => {
  return (
    <GqlMockedProvider<GetCoachingAnswerSetsQuery>>
      <CoachingQuestionsModal accountListId={accountListId} />
    </GqlMockedProvider>
  );
};

export const Null = (): ReactElement => {
  return (
    <GqlMockedProvider<GetCoachingAnswerSetsQuery>
      mocks={{ coachingAnswerSets: [{ questions: [] }] }}
    >
      <MuiThemeProvider theme={theme}>
        <CoachingQuestionsModal accountListId={accountListId} />
      </MuiThemeProvider>
    </GqlMockedProvider>
  );
};

export const ShortAnswer = (): ReactElement => {
  return (
    <GqlMockedProvider<GetCoachingAnswerSetsQuery>>
      <CoachingQuestionsModal accountListId={accountListId} />
    </GqlMockedProvider>
  );
};

export const ResponseOptions = (): ReactElement => {
  return (
    <GqlMockedProvider<GetCoachingAnswerSetsQuery>>
      <CoachingQuestionsModal accountListId={accountListId} />
    </GqlMockedProvider>
  );
};
