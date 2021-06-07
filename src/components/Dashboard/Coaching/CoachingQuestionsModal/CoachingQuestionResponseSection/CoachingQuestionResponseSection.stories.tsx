import React, { ReactElement } from 'react';

import CoachingQuestionResponseSection from './CoachingQuestionResponseSection';

export default {
  title: 'Coaching/CoachingQuestionsModal/ResponseSection',
};

const questionPrompt = 'Question';

export const ShortAnswer = (): ReactElement => {
  return (
    <CoachingQuestionResponseSection
      questionPrompt={questionPrompt}
      responseOptions={null}
      selectedResponseValue={undefined}
      onResponseChanged={() => {}}
    />
  );
};

export const ShortAnswerWithResponse = (): ReactElement => {
  return (
    <CoachingQuestionResponseSection
      questionPrompt={questionPrompt}
      responseOptions={null}
      selectedResponseValue={'my response'}
      onResponseChanged={() => {}}
    />
  );
};

export const ResponseOptions = (): ReactElement => {
  return (
    <CoachingQuestionResponseSection
      questionPrompt={questionPrompt}
      responseOptions={['option 1', 'option 2', 'option 3', 'option 4']}
      selectedResponseValue={undefined}
      onResponseChanged={() => {}}
    />
  );
};

export const ResponseOptionsWithResponse = (): ReactElement => {
  return (
    <CoachingQuestionResponseSection
      questionPrompt={questionPrompt}
      responseOptions={['option 1', 'option 2', 'option 3', 'option 4']}
      selectedResponseValue={'1'}
      onResponseChanged={() => {}}
    />
  );
};
