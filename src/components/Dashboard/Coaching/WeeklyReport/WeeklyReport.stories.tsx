import React, { ReactElement } from 'react';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import { GetCoachingAnswerSetsQuery } from '../GetCoachingAnswerSets.generated';
import WeeklyReport from './WeeklyReport';

export default {
  title: 'Coaching/WeeklyReport',
};

const accountListId = '111';

export const Loading = (): ReactElement => {
  return (
    <GqlMockedProvider<GetCoachingAnswerSetsQuery>>
      <WeeklyReport accountListId={accountListId} />
    </GqlMockedProvider>
  );
};

export const NoQuestions = (): ReactElement => {
  return (
    <GqlMockedProvider<GetCoachingAnswerSetsQuery>>
      <WeeklyReport accountListId={accountListId} />
    </GqlMockedProvider>
  );
};

export const Questions = (): ReactElement => {
  return (
    <GqlMockedProvider<GetCoachingAnswerSetsQuery>>
      <WeeklyReport accountListId={accountListId} />
    </GqlMockedProvider>
  );
};
