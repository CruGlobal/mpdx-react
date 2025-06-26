import { MockedResponse } from '@apollo/client/testing';
import {
  CurrentCoachingAnswerSetDocument,
  CurrentCoachingAnswerSetQuery,
} from './WeeklyReportModal.generated';

const populatedCoachingAnswerSet: CurrentCoachingAnswerSetQuery = {
  currentCoachingAnswerSet: {
    questions: [
      {
        id: 'question-1',
        prompt: 'What is your goal for this week?',
        required: true,
        position: 1,
      },
      {
        id: 'question-2',
        prompt: 'Rate your progress on a scale of 1 to 5.',
        required: true,
        position: 2,
      },
      {
        id: 'question-3',
        prompt: 'What challenges did you face?',
        required: true,
        position: 3,
      },
    ],
    answers: [],
    id: 'answer-set-123',
    completedAt: null,
  },
};

const emptyCoachingAnswerSet: CurrentCoachingAnswerSetQuery = {
  currentCoachingAnswerSet: {
    questions: [],
    answers: [],
    id: 'answer-set-123',
    completedAt: null,
  },
};

export const PopulateCoachingAnswerSetMock = (): MockedResponse => {
  return {
    request: {
      query: CurrentCoachingAnswerSetDocument,
      variables: {
        accountListId: 'abc',
        organizationId: 'org-123',
      },
    },
    result: {
      data: populatedCoachingAnswerSet,
    },
  };
};

export const EmptyCoachingAnswerSetMock = (): MockedResponse => {
  return {
    request: {
      query: CurrentCoachingAnswerSetDocument,
      variables: {
        accountListId: 'abc',
        organizationId: 'org-123',
      },
    },
    result: {
      data: emptyCoachingAnswerSet,
    },
  };
};
