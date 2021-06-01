import {
  CoachingAnswerSet,
  CoachingAnswer,
  CoachingQuestion,
} from '../../../../graphql/types.generated';

const getCoachingAnswerSets = (
  data: {
    id: string;
    type: string;
    attributes: {
      completed_at: string;
      created_at: string;
      updated_at: string;
    };
    relationships: {
      answers: {
        data: {
          id: string;
          created_at: string;
          response: string;
          question: {
            id: string;
            created_at: string;
            position: number;
            prompt: string;
            required: boolean;
            response_options: string[] | null;
            updated_at: string;
          };
          updated_at: string;
        }[];
      };
      questions: {
        data: {
          id: string;
          answer: {
            id: string;
            created_at: string;
            response: string;
            updated_at: string;
          };
          created_at: string;
          position: number;
          prompt: string;
          required: boolean;
          response_options: string[] | null;
          updated_at: string;
        }[];
      };
    };
  }[],
): CoachingAnswerSet[] => {
  const response: CoachingAnswerSet[] = [];

  data.forEach(
    ({
      id,
      attributes: { completed_at, created_at, updated_at },
      relationships: {
        answers: { data: answersData },
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
    answer: {
      id: string;
      created_at: string;
      response: string;
      updated_at: string;
    };
    created_at: string;
    position: number;
    prompt: string;
    required: boolean;
    response_options: string[] | null;
    updated_at: string;
  }[],
): CoachingQuestion[] => {
  const questions: CoachingQuestion[] = [];

  data.forEach(
    ({
      id,
      answer,
      created_at,
      position,
      prompt,
      required,
      response_options,
      updated_at,
    }) => {
      const question: CoachingQuestion = {
        id,
        answer: {
          id: answer.id,
          createdAt: answer.created_at,
          response: answer.response,
          updatedAt: answer.updated_at,
        },
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
    question: {
      id: string;
      created_at: string;
      position: number;
      prompt: string;
      required: boolean;
      response_options: string[] | null;
      updated_at: string;
    };
    updated_at: string;
  }[],
): CoachingAnswer[] => {
  const answers: CoachingAnswer[] = [];

  data.forEach(({ id, created_at, response, question, updated_at }) => {
    const answer: CoachingAnswer = {
      id,
      createdAt: created_at,
      response,
      question: {
        id: question.id,
        createdAt: question.created_at,
        position: question.position,
        prompt: question.prompt,
        required: question.required,
        responseOptions: question.response_options,
        updatedAt: question.updated_at,
      },
      updatedAt: updated_at,
    };

    answers.push(answer);
  });

  return answers;
};

export { getCoachingAnswerSets };
