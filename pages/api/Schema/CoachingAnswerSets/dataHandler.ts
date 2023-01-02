import z from 'zod';
import {
  CoachingAnswerSet,
  CoachingAnswer,
  CoachingQuestion,
} from '../../../../graphql/types.generated';

const isNotNull = <T>(item: T | null): item is T => item !== null;

const coachingAnswerSetSchema = z.object({
  id: z.string(),
  type: z.literal('coaching_answer_sets'),
  attributes: z.object({
    completed_at: z.string().nullable(),
    created_at: z.string(),
    updated_at: z.string(),
  }),
  relationships: z
    .object({
      answers: z.object({
        data: z.array(
          z.object({
            id: z.string(),
            type: z.literal('coaching_answers'),
          }),
        ),
      }),
      questions: z.object({
        data: z.array(
          z.object({
            id: z.string(),
            type: z.literal('coaching_questions'),
          }),
        ),
      }),
    })
    .default({ answers: { data: [] }, questions: { data: [] } }),
});
type CoachingAnswerSetData = z.infer<typeof coachingAnswerSetSchema>;

const includedSchema = z
  .array(
    z.discriminatedUnion('type', [
      z.object({
        id: z.string(),
        type: z.literal('coaching_answers'),
        attributes: z.object({
          created_at: z.string(),
          response: z.string().nullable(),
          updated_at: z.string(),
        }),
        relationships: z.object({
          question: z.object({
            data: z.object({
              id: z.string(),
              type: z.literal('coaching_questions'),
            }),
          }),
        }),
      }),

      z.object({
        id: z.string(),
        type: z.literal('coaching_questions'),
        attributes: z.object({
          created_at: z.string(),
          position: z.number(),
          prompt: z.string(),
          required: z.boolean(),
          response_options: z.array(z.string()).nullable(),
          updated_at: z.string(),
        }),
      }),
    ]),
  )
  .default([]);
type IncludedData = z.infer<typeof includedSchema>;

const singleCoachingAnswerSetSchema = z.object({
  data: coachingAnswerSetSchema,
  included: includedSchema,
});

const multiCoachingAnswerSetSchema = z.object({
  data: z.array(coachingAnswerSetSchema),
  included: includedSchema,
});

const parseCoachingAnswerSet = (
  answerSetData: CoachingAnswerSetData,
  included: IncludedData,
): CoachingAnswerSet => {
  const {
    id,
    attributes: { completed_at, created_at, updated_at },
  } = answerSetData;

  const answers = answerSetData.relationships.answers.data
    .map(({ id }) => getIncludedAnswer(id, included))
    .filter(isNotNull);
  const questions = answerSetData.relationships.questions.data
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

export const getCoachingAnswerSet = (response: unknown): CoachingAnswerSet => {
  const { data: answerSetData, included } =
    singleCoachingAnswerSetSchema.parse(response);
  return parseCoachingAnswerSet(answerSetData, included);
};

export const getCoachingAnswerSets = (
  response: unknown,
): CoachingAnswerSet[] => {
  const { data, included } = multiCoachingAnswerSetSchema.parse(response);
  return data.map((answerSetData) =>
    parseCoachingAnswerSet(answerSetData, included),
  );
};

const createOrUpdateAnswerSchema = z.object({
  data: z.object({
    id: z.string(),
    type: z.string(),
    attributes: z.object({
      created_at: z.string(),
      response: z.string(),
      updated_at: z.string(),
    }),
    relationships: z.object({
      question: z.object({
        data: z.object({
          id: z.string(),
          type: z.literal('coaching_questions'),
        }),
      }),
    }),
  }),
  included: includedSchema,
});

export const getCoachingAnswer = (response: unknown): CoachingAnswer => {
  const { data, included } = createOrUpdateAnswerSchema.parse(response);
  const question = getIncludedQuestion(
    data.relationships.question.data.id,
    included,
  );
  if (!question) {
    throw new Error('Could not find question for coaching answer');
  }
  return {
    id: data.id,
    createdAt: data.attributes.created_at,
    updatedAt: data.attributes.updated_at,
    response: data.attributes.response,
    question,
  };
};
