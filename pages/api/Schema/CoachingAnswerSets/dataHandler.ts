import {
  CoachingAnswerSet,
  CoachingAnswer,
  CoachingQuestion,
} from '../../../../graphql/types.generated';

export type CoachingAnswerSetData = CoachingAnswerSetResponseData[];

export type CoachingAnswerSetIncluded = (
  | CoachingAnswerResponse
  | CoachingQuestionResponse
)[];

interface CoachingAnswerSetResponseData {
  id: string;
  type: 'coaching_answer_sets';
  attributes: {
    completed_at: string;
    created_at: string;
    updated_at: string;
  };
  relationships: {
    answers: {
      data: {
        id: string;
        type: 'coaching_answers';
      }[];
    };
    questions: {
      data: {
        id: string;
        type: 'coaching_questions';
      }[];
    };
  };
}

interface CoachingAnswerResponse {
  id: string;
  type: 'coaching_answers';
  attributes: {
    created_at: string;
    response: string;
    updated_at: string;
  };
}

interface CoachingQuestionResponse {
  id: string;
  type: 'coaching_questions';
  attributes: {
    created_at: string;
    position: number;
    prompt: string;
    required: boolean;
    response_options: string[] | null;
    updated_at: string;
  };
}

const getCoachingAnswerSets = (
  data: CoachingAnswerSetData,
  included: CoachingAnswerSetIncluded,
): CoachingAnswerSet[] => {
  const response: CoachingAnswerSet[] = [];

  data.forEach((answerSetData) => {
    const {
      id,
      attributes: { completed_at, created_at, updated_at },
    } = answerSetData;

    //create answers
    const answers = createCoachingAnswersList(answerSetData, included);
    //create questions
    const questions = createCoachingQuestionsList(answerSetData, included);

    const answerSet: CoachingAnswerSet = {
      id,
      answers,
      completedAt: completed_at,
      createdAt: created_at,
      questions,
      updatedAt: updated_at,
    };

    response.push(answerSet);
  });

  return response;
};

const createCoachingAnswersList = (
  answerSetData: CoachingAnswerSetResponseData,
  includedItems: CoachingAnswerSetIncluded,
): CoachingAnswer[] => {
  const answers: CoachingAnswer[] = [];

  const ids = answerSetData.relationships.answers.data.map(
    (answer) => answer.id,
  );

  ids.forEach((id) => {
    const answerItem = includedItems.find(
      (item) => item.id === id,
    ) as CoachingAnswerResponse;

    if (answerItem && answerItem.type === 'coaching_answers') {
      const {
        attributes: { created_at, response, updated_at },
      } = answerItem;

      const answer: CoachingAnswer = {
        id,
        createdAt: created_at,
        response,
        updatedAt: updated_at,
      };

      answers.push(answer);
    }
  });

  return answers;
};

const createCoachingQuestionsList = (
  answerSetData: CoachingAnswerSetResponseData,
  includedItems: CoachingAnswerSetIncluded,
): CoachingQuestion[] => {
  const questions: CoachingQuestion[] = [];

  const ids = answerSetData.relationships.questions.data.map(
    (question) => question.id,
  );

  ids.forEach((id) => {
    const questionItem = includedItems.find(
      (item) => item.id === id,
    ) as CoachingQuestionResponse;

    if (questionItem && questionItem.type === 'coaching_questions') {
      const {
        attributes: {
          created_at,
          position,
          prompt,
          required,
          response_options,
          updated_at,
        },
      } = questionItem;

      const question: CoachingQuestion = {
        id,
        createdAt: created_at,
        position,
        prompt,
        required,
        responseOptions: response_options,
        updatedAt: updated_at,
      };

      questions.push(question);
    }
  });

  return questions;
};

export { getCoachingAnswerSets };
