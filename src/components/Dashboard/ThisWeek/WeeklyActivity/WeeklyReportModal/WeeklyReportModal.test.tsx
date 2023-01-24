import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InMemoryCache } from '@apollo/client';
import { ThemeProvider } from '@mui/material/styles';
import { cloneDeep } from 'lodash';
import { WeeklyReportModal } from './WeeklyReportModal';
import theme from 'src/theme';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import TestRouter from '__tests__/util/TestRouter';
import {
  CurrentCoachingAnswerSetDocument,
  CurrentCoachingAnswerSetQuery,
} from './WeeklyReportModal.generated';

const organizationId = 'org-1';
const accountListId = 'account-list-1';
const router = {
  query: { accountListId },
  isReady: true,
};

const mocks = {
  GetTopBar: {
    accountLists: {
      nodes: [
        {
          id: accountListId,
          name: 'Org 1',
          salaryOrganizationId: organizationId,
        },
      ],
    },
  },
  CurrentCoachingAnswerSet: {
    currentCoachingAnswerSet: {
      id: 'answer-set-1',
      answers: [
        {
          id: 'answer-1',
          response: 'Answer',
          question: { id: 'question-1' },
        },
      ],
      completedAt: null,
      questions: [
        {
          id: 'question-1',
          position: 1,
          prompt: 'Question',
          required: true,
          responseOptions: null,
        },
      ],
    },
  },
};

const mocksWithoutAnswers = cloneDeep(mocks);
mocksWithoutAnswers.CurrentCoachingAnswerSet.currentCoachingAnswerSet.answers =
  [];

describe('Weekly Report Modal', () => {
  describe('getAnswer', () => {
    it('loads previously saved answers', async () => {
      const { findByRole } = render(
        <ThemeProvider theme={theme}>
          <TestRouter router={router}>
            <GqlMockedProvider mocks={mocks}>
              <WeeklyReportModal
                accountListId={accountListId}
                open={true}
                onClose={() => {}}
              />
            </GqlMockedProvider>
          </TestRouter>
        </ThemeProvider>,
      );

      expect(await findByRole('textbox')).toHaveValue('Answer');
    });
  });

  describe('saveAnswer', () => {
    it('saves new answers and updates the cache', async () => {
      const mocksWithoutAnswers = cloneDeep(mocks);
      mocksWithoutAnswers.CurrentCoachingAnswerSet.currentCoachingAnswerSet.answers =
        [];
      const cache = new InMemoryCache();
      const mutationSpy = jest.fn();
      const { getByRole, findByRole } = render(
        <ThemeProvider theme={theme}>
          <TestRouter router={router}>
            <GqlMockedProvider
              mocks={mocksWithoutAnswers}
              cache={cache}
              onCall={mutationSpy}
            >
              <WeeklyReportModal
                accountListId={accountListId}
                open={true}
                onClose={() => {}}
              />
            </GqlMockedProvider>
          </TestRouter>
        </ThemeProvider>,
      );

      const textbox = await findByRole('textbox');
      userEvent.type(textbox, 'Answer');
      mutationSpy.mockReset();
      userEvent.click(getByRole('button', { name: 'Submit' }));
      await waitFor(() => {
        expect(mutationSpy).toHaveBeenCalledTimes(1);
        expect(mutationSpy.mock.calls[0][0]).toMatchObject({
          operation: {
            operationName: 'SaveCoachingAnswer',
            variables: {
              answerSetId: 'answer-set-1',
              answerId: null,
              response: 'Answer',
              questionId: 'question-1',
            },
          },
        });

        expect(
          cache.readQuery<CurrentCoachingAnswerSetQuery>({
            query: CurrentCoachingAnswerSetDocument,
            variables: {
              accountListId,
              organizationId,
            },
          })?.currentCoachingAnswerSet.answers,
        ).toHaveLength(1);
      });
    });

    it('overwrites existing answers', async () => {
      const mutationSpy = jest.fn();
      const { getByRole, findByRole } = render(
        <ThemeProvider theme={theme}>
          <TestRouter router={router}>
            <GqlMockedProvider mocks={mocks} onCall={mutationSpy}>
              <WeeklyReportModal
                accountListId={accountListId}
                open={true}
                onClose={() => {}}
              />
            </GqlMockedProvider>
          </TestRouter>
        </ThemeProvider>,
      );

      const textbox = await findByRole('textbox');
      userEvent.clear(textbox);
      userEvent.type(textbox, 'New Answer');
      mutationSpy.mockReset();
      userEvent.click(getByRole('button', { name: 'Submit' }));
      await waitFor(() => {
        expect(mutationSpy).toHaveBeenCalledTimes(1);
        expect(mutationSpy.mock.calls[0][0]).toMatchObject({
          operation: {
            operationName: 'SaveCoachingAnswer',
            variables: {
              answerSetId: 'answer-set-1',
              answerId: 'answer-1',
              response: 'New Answer',
              questionId: 'question-1',
            },
          },
        });
      });
    });
  });
});
