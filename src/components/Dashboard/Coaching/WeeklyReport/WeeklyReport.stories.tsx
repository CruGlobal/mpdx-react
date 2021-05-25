import React, { ReactElement } from 'react';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import { GetCoachingAnswerSetsQuery } from '../GetCoachingAnswerSets.generated';
import WeeklyReport from './WeeklyReport';

export default {
  title: 'Coaching/WeeklyReport',
};

const accountListId = '111';

export const NoQuestions = (): ReactElement => {
  const mock = {
    GetCoachingAnswerSets: {
      coachingAnswerSets: [{ id: '1', answers: [], questions: [] }],
    },
  };

  return (
    <GqlMockedProvider<GetCoachingAnswerSetsQuery> mocks={mock}>
      <WeeklyReport accountListId={accountListId} />
    </GqlMockedProvider>
  );
};

export const Questions = (): ReactElement => {
  const mock = {
    GetCoachingAnswerSets: {
      coachingAnswerSets: [
        { id: '1', answers: [], questions: [{ id: '2' }, { id: '3' }] },
      ],
    },
  };

  return (
    <GqlMockedProvider<GetCoachingAnswerSetsQuery> mocks={mock}>
      <WeeklyReport accountListId={accountListId} />
    </GqlMockedProvider>
  );
};
