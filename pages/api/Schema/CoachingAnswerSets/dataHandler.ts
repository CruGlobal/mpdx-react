import {
  CoachingAnswerSet,
  CoachingAnswer,
  CoachingQuestion,
} from '../../../../graphql/types.generated';

export interface CoachingAnswerSetResponse {
  id: string;
  type: 'coaching_answer_sets';
  attributes: {
    completed_at: string;
    created_at: string;
    updated_at: string;
  };
  relationships: {
    answers: { data: CoachingAnswerResponse[] };
    questions: { data: CoachingQuestionResponse[] };
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
  data: CoachingAnswerSetResponse[],
): CoachingAnswerSet[] => {
  const response: CoachingAnswerSet[] = [];
  debugger;
  data.forEach(
    ({
      id,
      attributes: { completed_at, created_at, updated_at },
      relationships: {
        answers: { data: answersData },
        questions: { data: questionsData },
      },
    }) => {
      //create answers
      const answers = createCoachingAnswersList(answersData);
      //create questions
      const questions = createCoachingQuestionsList(questionsData);

      const answerSet: CoachingAnswerSet = {
        id,
        answers,
        completedAt: completed_at,
        createdAt: created_at,
        questions,
        updatedAt: updated_at,
      };

      response.push(answerSet);
    },
  );

  return response;
};

const createCoachingAnswersList = (
  data: CoachingAnswerResponse[],
): CoachingAnswer[] => {
  const answers: CoachingAnswer[] = [];
  debugger;
  data.forEach(({ id, attributes: { created_at, response, updated_at } }) => {
    const answer: CoachingAnswer = {
      id,
      createdAt: created_at,
      response,
      updatedAt: updated_at,
    };

    answers.push(answer);
  });

  return answers;
};

const createCoachingQuestionsList = (
  data: CoachingQuestionResponse[],
): CoachingQuestion[] => {
  const questions: CoachingQuestion[] = [];
  debugger;
  data.forEach(
    ({
      id,
      attributes: {
        created_at,
        position,
        prompt,
        required,
        response_options,
        updated_at,
      },
    }) => {
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
    },
  );

  return questions;
};

export { getCoachingAnswerSets };
