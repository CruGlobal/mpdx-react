import {
  CoachingAnswerSet,
  CoachingAnswer,
  CoachingQuestion,
} from '../../../../graphql/types.generated';

export interface CoachingAnswerSetResponse {
  id: string;
  type: string;
  attributes: {
    completed_at: string;
    created_at: string;
    updated_at: string;
  };
  relationships: {
    answers: {
      id: string;
      created_at: string;
      response: string;
      updated_at: string;
    }[];
    questions: {
      data: {
        id: string;
        created_at: string;
        position: number;
        prompt: string;
        required: boolean;
        response_options: string[] | null;
        updated_at: string;
      }[];
    };
  };
}

const getCoachingAnswerSets = (
  data: CoachingAnswerSetResponse[],
): CoachingAnswerSet[] => {
  debugger;
  const response: CoachingAnswerSet[] = [];

  data.forEach(
    ({
      id,
      attributes: { completed_at, created_at, updated_at },
      relationships: {
        answers: answersData,
        questions: { data: questionsData },
      },
    }) => {
      //create questions
      const questions = createCoachingQuestionsList(questionsData);
      //create answers
      const answers = createCoachingAnswersList(answersData);

      const answerSet: CoachingAnswerSet = {
        id: id,
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

const createCoachingQuestionsList = (
  data: {
    id: string;
    created_at: string;
    position: number;
    prompt: string;
    required: boolean;
    response_options: string[] | null;
    updated_at: string;
  }[],
): CoachingQuestion[] => {
  debugger;
  const questions: CoachingQuestion[] = [];

  data.forEach(
    ({
      id,
      created_at,
      position,
      prompt,
      required,
      response_options,
      updated_at,
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

const createCoachingAnswersList = (
  data: {
    id: string;
    created_at: string;
    response: string;
    updated_at: string;
  }[],
): CoachingAnswer[] => {
  debugger;
  const answers: CoachingAnswer[] = [];

  data.forEach(({ id, created_at, response, updated_at }) => {
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

export { getCoachingAnswerSets };
