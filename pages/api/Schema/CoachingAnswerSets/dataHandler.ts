import {
  CoachingAnswer,
  CoachingAnswerSet,
  CoachingQuestion,
} from '../../../../graphql/types.generated';

const isNotNull = <T>(item: T | null): item is T => item !== null;

interface CoachingAnswerSetData {
  id: string;
  type: 'coaching_answer_sets';
  attributes: {
    completed_at: string | null;
    created_at: string;
    updated_at: string;
  };
  relationships?: {
    answers: {
      data: Array<{
        id: string;
        type: 'coaching_answers';
      }>;
    };
    questions: {
      data: Array<{
        id: string;
        type: 'coaching_questions';
      }>;
    };
  };
}

type IncludedData = Array<
  | {
      type: 'coaching_answers';
      id: string;
      attributes: {
        created_at: string;
        response: string | null;
        updated_at: string;
      };
      relationships: {
        question: {
          data: {
            type: 'coaching_questions';
            id: string;
          };
        };
      };
    }
  | {
      type: 'coaching_questions';
      id: string;
      attributes: {
        created_at: string;
        position: number;
        prompt: string;
        required: boolean;
        response_options: string[] | null;
        updated_at: string;
      };
    }
>;

const parseCoachingAnswerSet = (
  answerSetData: CoachingAnswerSetData,
  included: IncludedData = [],
): CoachingAnswerSet => {
  const {
    id,
    attributes: { completed_at, created_at, updated_at },
  } = answerSetData;

  const relationships = answerSetData.relationships ?? {
    answers: { data: [] },
    questions: { data: [] },
  };
  const answers = relationships.answers.data
    .map(({ id }) => getIncludedAnswer(id, included))
    .filter(isNotNull);
  const questions = relationships.questions.data
    .map(({ id }) => getIncludedQuestion(id, included))
    .filter(isNotNull);

  return {
    id,
    answers,
    completedAt: completed_at,
    createdAt: created_at,
    questions,
    updatedAt: updated_at,
  };
};

// Find the coaching question with the provided id in the included data
const getIncludedQuestion = (
  questionId: string,
  included: IncludedData,
): CoachingQuestion | null => {
  const questionItem = included.find((item) => item.id === questionId);

  if (questionItem && questionItem.type === 'coaching_questions') {
    const {
      id,
      attributes: {
        created_at,
        position,
        prompt,
        required,
        response_options,
        updated_at,
      },
    } = questionItem;

    return {
      id,
      createdAt: created_at,
      position,
      prompt,
      required,
      responseOptions: response_options,
      updatedAt: updated_at,
    };
  }

  return null;
};

// Find the coaching answer with the provided id in the included data
const getIncludedAnswer = (
  answerId: string,
  included: IncludedData,
): CoachingAnswer | null => {
  const answerItem = included.find((item) => item.id === answerId);
  if (answerItem && answerItem.type === 'coaching_answers') {
    const question = getIncludedQuestion(
      answerItem.relationships.question.data.id,
      included,
    );
    if (!question) {
      throw new Error('Could not find question for coaching answer');
    }

    const {
      id,
      attributes: { created_at, response, updated_at },
    } = answerItem;

    return {
      id,
      createdAt: created_at,
      response,
      updatedAt: updated_at,
      question,
    };
  }

  return null;
};

export const getCoachingAnswerSet = (response: {
  data: CoachingAnswerSetData;
  included?: IncludedData;
}): CoachingAnswerSet => {
  const { data: answerSetData, included } = response;
  return parseCoachingAnswerSet(answerSetData, included ?? []);
};

export const getCoachingAnswerSets = (response: {
  data: Array<CoachingAnswerSetData>;
  included?: IncludedData;
}): CoachingAnswerSet[] => {
  const { data, included } = response;
  return data.map((answerSetData) =>
    parseCoachingAnswerSet(answerSetData, included ?? []),
  );
};

interface CreateOrUpdateAnswer {
  data: {
    id: string;
    type: string;
    attributes: {
      response: string;
      created_at: string;
      updated_at: string;
    };
    relationships: {
      question: {
        data: {
          id: string;
          type: 'coaching_questions';
        };
      };
    };
  };
  included?: IncludedData;
}

export const getCoachingAnswer = (
  response: CreateOrUpdateAnswer,
): CoachingAnswer => {
  const {
    data: {
      id,
      attributes: { created_at, updated_at, response: responseAttr },
      relationships,
    },
    included,
  } = response;
  const question = getIncludedQuestion(
    relationships.question.data.id,
    included ?? [],
  );
  if (!question) {
    throw new Error('Could not find question for coaching answer');
  }
  return {
    id: id,
    createdAt: created_at,
    updatedAt: updated_at,
    response: responseAttr,
    question,
  };
};
