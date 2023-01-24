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
        {
          id: 'question-2',
          position: 2,
          prompt: 'Radio Question',
          required: true,
          responseOptions: ['Option 1', 'Option 2', 'Option 3'],
        },
      ],
    },
  },
};

const mocksWithoutAnswers = cloneDeep(mocks);
mocksWithoutAnswers.CurrentCoachingAnswerSet.currentCoachingAnswerSet.answers =
  [];

describe('Weekly Report Modal', () => {
  it('renders textbox questions', async () => {
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

    expect(
      await findByRole('textbox', { name: 'Question' }),
    ).toBeInTheDocument();
  });

  it('renders radio button questions', async () => {
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

    userEvent.click(await findByRole('button', { name: 'Next' }));
    expect(await findByRole('radiogroup')).toBeInTheDocument();
    expect(await findByRole('radio', { name: 'Option 1' })).toBeInTheDocument();
  });

  it('navigates between pages', async () => {
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

    userEvent.click(await findByRole('button', { name: 'Next' }));
    userEvent.click(await findByRole('button', { name: 'Back' }));
    expect(
      await findByRole('textbox', { name: 'Question' }),
    ).toBeInTheDocument();
  });

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
      userEvent.click(getByRole('button', { name: 'Next' }));
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
      userEvent.click(getByRole('button', { name: 'Next' }));
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

  it('refreshes the weekly report one second after close', async () => {
    const mutationSpy = jest.fn();
    const { findByRole } = render(
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

    userEvent.click(await findByRole('button', { name: 'Next' }));
    userEvent.click(await findByRole('radio', { name: 'Option 1' }));
    userEvent.click(await findByRole('button', { name: 'Close' }));
    mutationSpy.mockReset();

    await waitFor(
      () =>
        expect(
          mutationSpy.mock.calls.find(
            (args) =>
              args[0].operation.operationName === 'CurrentCoachingAnswerSet',
          ),
        ).toBeDefined(),
      { timeout: 3000 },
    );
  });
});
