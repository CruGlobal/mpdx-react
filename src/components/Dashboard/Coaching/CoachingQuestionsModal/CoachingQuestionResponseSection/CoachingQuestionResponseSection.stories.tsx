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

const questionIndex = 1;

export const ShortAnswer = (): ReactElement => {
  const question = gqlMock<FormQuestionFragment>(FormQuestionFragmentDoc, {
    mocks: {
      responseOptions: null,
    },
  });

  return (
    <CoachingQuestionResponseSection
      questionIndex={questionIndex}
      responseValue={''}
      question={question}
      onResponseChanged={() => {}}
    />
  );
};

export const ShortAnswerWithResponse = (): ReactElement => {
  const question = gqlMock<FormQuestionFragment>(FormQuestionFragmentDoc, {
    mocks: {
      responseOptions: null,
    },
  });

  return (
    <CoachingQuestionResponseSection
      questionIndex={questionIndex}
      responseValue={'Sample Response'}
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
      questionIndex={questionIndex}
      responseValue={''}
      question={question}
      onResponseChanged={() => {}}
    />
  );
};

export const ResponseOptionsWithResponse = (): ReactElement => {
  const question = gqlMock<FormQuestionFragment>(FormQuestionFragmentDoc, {
    mocks: {
      responseOptions: ['option 1', 'option 2', 'option 3', 'option 4'],
    },
  });

  return (
    <CoachingQuestionResponseSection
      questionIndex={questionIndex}
      responseValue={'2'}
      question={question}
      onResponseChanged={() => {}}
    />
  );
};
