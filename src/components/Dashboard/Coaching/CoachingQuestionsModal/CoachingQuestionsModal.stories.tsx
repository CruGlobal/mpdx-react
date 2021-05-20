import React, { ReactElement } from 'react';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import { GetCoachingAnswerSetsQuery } from '../GetCoachingAnswerSets.generated';
import CoachingQuestionsModal from './CoachingQuestionsModal';

export default {
  title: 'Coaching/CoachingQuestionsModal',
};

const accountListId = '111';

export const Null = (): ReactElement => {
  return (
    <GqlMockedProvider<GetCoachingAnswerSetsQuery>>
      <CoachingQuestionsModal accountListId={accountListId} />
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
