import React, { ReactElement } from 'react';
import { gqlMock } from '../../../../../../__tests__/util/graphqlMocking';
import {
  FormQuestionFragment,
  FormQuestionFragmentDoc,
} from '../../GetCoachingAnswerSets.generated';

import CoachingQuestionResponseSection from './CoachingQuestionResponseSection';

export default {
  title: 'Coaching/CoachingQuestionsModal/ResponseSection',
};

export const ShortAnswer = (): ReactElement => {
  const question = gqlMock<FormQuestionFragment>(FormQuestionFragmentDoc, {
    mocks: {
      responseOptions: null,
    },
  });

  return (
    <CoachingQuestionResponseSection
      question={question}
      onResponseChanged={() => {}}
    />
  );
};

export const ResponseOptions = (): ReactElement => {
  const question = gqlMock<FormQuestionFragment>(FormQuestionFragmentDoc, {
    mocks: {
      responseOptions: ['option 1', 'option 2', 'option 3', 'option 4'],
    },
  });

  return (
    <CoachingQuestionResponseSection
      question={question}
      onResponseChanged={() => {}}
    />
  );
};
