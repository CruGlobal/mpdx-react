import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateTime, Settings } from 'luxon';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { WeeklyReport } from './WeeklyReport';
import { WeeklyReportsQuery } from './WeeklyReport.generated';

const generateAnswer = (position: number, suffix: string) => ({
  response: `Answer ${position}${suffix}`,
  question: {
    position,
    prompt: `Question ${position}${suffix}`,
  },
});

const mocks = {
  WeeklyReports: {
    coachingAnswerSets: [
      {
        completedAt: DateTime.local(2023, 11, 1).toISO(),
        answers: [
          generateAnswer(3, 'a'),
          generateAnswer(1, 'a'),
          generateAnswer(2, 'a'),
        ],
      },
      {
        completedAt: DateTime.local(2022, 10, 1).toISO(),
        answers: [
          generateAnswer(3, 'b'),
          generateAnswer(1, 'b'),
          generateAnswer(2, 'b'),
        ],
      },
    ],
  },
};

const accountListId = 'account-list-1';

const TestComponent: React.FC = () => (
  <GqlMockedProvider<{ WeeklyReports: WeeklyReportsQuery }> mocks={mocks}>
    <WeeklyReport accountListId={accountListId} />
  </GqlMockedProvider>
);

describe('WeeklyReport', () => {
  beforeEach(() => {
    Settings.now = () => new Date(2023, 12, 1).valueOf();
  });

  describe('previous/next buttons', () => {
    it('both buttons are disabled until the reports load', () => {
      const { getAllByTestId, getByRole } = render(<TestComponent />);

      expect(getAllByTestId('MultilineSkeletonLine')).not.toHaveLength(0);
      expect(getByRole('button', { name: 'Next' })).toBeDisabled();
      expect(getByRole('button', { name: 'Previous' })).toBeDisabled();
    });

    it('next button is disabled when on the latest report', async () => {
      const { getByRole, getByTestId, queryByTestId } = render(
        <TestComponent />,
      );

      await waitFor(() =>
        expect(queryByTestId('MultilineSkeletonLine')).not.toBeInTheDocument(),
      );

      const next = getByRole('button', { name: 'Next' });
      const previous = getByRole('button', { name: 'Previous' });
      const completed = getByTestId('CompletedText');

      expect(next).toBeDisabled();
      await waitFor(() => expect(previous).not.toBeDisabled());
      expect(completed).toHaveTextContent('Nov 1');

      userEvent.click(previous);
      expect(next).not.toBeDisabled();
      expect(previous).toBeDisabled();
      expect(completed).toHaveTextContent('Oct 1, 2022');

      userEvent.click(next);
      expect(next).toBeDisabled();
      expect(previous).not.toBeDisabled();
      expect(completed).toHaveTextContent('Nov 1');
    });
  });

  it('renders the questions and answers sorted by position', async () => {
    const { findAllByTestId } = render(<TestComponent />);

    const answers = await findAllByTestId('Answer');
    expect(answers).toHaveLength(3);
    expect(answers[0]).toHaveTextContent('Question 1aAnswer 1a');
    expect(answers[1]).toHaveTextContent('Question 2aAnswer 2a');
    expect(answers[2]).toHaveTextContent('Question 3aAnswer 3a');
  });

  it('renders placeholder when there are no reports', async () => {
    const { findByText } = render(
      <GqlMockedProvider<{ WeeklyReports: WeeklyReportsQuery }>
        mocks={{ WeeklyReports: { coachingAnswerSets: [] } }}
      >
        <WeeklyReport accountListId={accountListId} />
      </GqlMockedProvider>,
    );

    expect(await findByText('No completed reports found')).toBeInTheDocument();
  });
});
