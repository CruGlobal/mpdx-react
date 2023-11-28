import { ThemeProvider } from '@emotion/react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Settings } from 'luxon';
import theme from 'src/theme';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import TestRouter from '__tests__/util/TestRouter';
import { AccountListTypeEnum, CoachingPeriodEnum } from '../CoachingDetail';
import { Activity } from './Activity';

const mocks = {
  CoachingDetailActivity: {
    accountListAnalytics: {
      appointments: {
        completed: 10,
      },
      contacts: {
        active: 20,
        referrals: 21,
        referralsOnHand: 22,
      },
      correspondence: {
        precall: 30,
        reminders: 31,
        supportLetters: 32,
        thankYous: 33,
        newsletters: 34,
      },
      electronic: {
        appointments: 40,
        received: 41,
        sent: 42,
      },
      email: {
        received: 50,
        sent: 51,
      },
      facebook: {
        received: 60,
        sent: 61,
      },
      phone: {
        attempted: 70,
        appointments: 71,
        completed: 72,
        received: 73,
        talkToInPerson: 74,
      },
      textMessage: {
        received: 80,
        sent: 81,
      },
    },
  },
};
const mutationSpy = jest.fn();

const accountListId = 'account-list-1';
const router = {
  query: {
    accountListId,
  },
  isReady: true,
};

interface TestComponentProps {
  accountListType?: AccountListTypeEnum;
  period?: CoachingPeriodEnum;
  noAppeal?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({
  accountListType = AccountListTypeEnum.Coaching,
  period = CoachingPeriodEnum.Weekly,
  noAppeal = false,
}) => (
  <TestRouter router={router}>
    <ThemeProvider theme={theme}>
      <GqlMockedProvider mocks={mocks} onCall={mutationSpy}>
        <Activity
          accountListId={accountListId}
          accountListType={accountListType}
          currency="USD"
          period={period}
          primaryAppeal={
            noAppeal
              ? undefined
              : {
                  id: 'appeal-1',
                  name: 'Ask',
                  amount: 1000,
                  pledgesAmountNotReceivedNotProcessed: 100,
                  pledgesAmountProcessed: 200,
                  pledgesAmountReceivedNotProcessed: 300,
                }
          }
        />
      </GqlMockedProvider>
    </ThemeProvider>
  </TestRouter>
);

describe('Activity', () => {
  beforeEach(() => {
    Settings.now = () => new Date(2020, 0, 8).valueOf();
  });

  describe('period', () => {
    it('is a week long when in weekly mode', async () => {
      const { getByTestId } = render(<TestComponent />);

      expect(getByTestId('ActivityPeriod')).toHaveTextContent('Jan 6 - Jan 12');
      await waitFor(() =>
        expect(mutationSpy.mock.calls[0][0].operation).toMatchObject({
          operationName: 'CoachingDetailActivity',
          variables: {
            dateRange: '2020-01-06..2020-01-12',
          },
        }),
      );
    });

    it('is a month long when in monthly mode', async () => {
      const { getByTestId } = render(
        <TestComponent period={CoachingPeriodEnum.Monthly} />,
      );

      expect(getByTestId('ActivityPeriod')).toHaveTextContent('Jan 1 - Jan 31');
      await waitFor(() =>
        expect(mutationSpy.mock.calls[0][0].operation).toMatchObject({
          operationName: 'CoachingDetailActivity',
          variables: {
            dateRange: '2020-01-01..2020-01-31',
          },
        }),
      );
    });

    it('shows the year when in a different year', () => {
      const { getByRole, getByTestId } = render(<TestComponent />);

      userEvent.click(getByRole('button', { name: 'Previous' }));
      expect(getByTestId('ActivityPeriod')).toHaveTextContent(
        'Dec 30, 2019 - Jan 5, 2020',
      );
    });

    it('resets when the period changes', () => {
      const { getByRole, getByTestId, rerender } = render(
        <TestComponent period={CoachingPeriodEnum.Monthly} />,
      );

      userEvent.click(getByRole('button', { name: 'Previous' }));
      rerender(<TestComponent />);
      expect(getByTestId('ActivityPeriod')).toHaveTextContent('Jan 6 - Jan 12');
    });
  });

  describe('previous/next buttons', () => {
    it('loads a new weekly period', async () => {
      const { getByRole } = render(<TestComponent />);

      const next = getByRole('button', { name: 'Next' });
      const previous = getByRole('button', { name: 'Previous' });

      userEvent.click(previous);
      await waitFor(() =>
        expect(mutationSpy.mock.calls[1][0].operation).toMatchObject({
          operationName: 'CoachingDetailActivity',
          variables: {
            dateRange: '2019-12-30..2020-01-05',
          },
        }),
      );

      userEvent.click(next);
      await waitFor(() =>
        expect(mutationSpy.mock.calls[2][0].operation).toMatchObject({
          operationName: 'CoachingDetailActivity',
          variables: {
            dateRange: '2020-01-06..2020-01-12',
          },
        }),
      );
    });

    it('loads a new monthly period', async () => {
      const { getByRole } = render(
        <TestComponent period={CoachingPeriodEnum.Monthly} />,
      );

      const next = getByRole('button', { name: 'Next' });
      const previous = getByRole('button', { name: 'Previous' });

      userEvent.click(previous);
      await waitFor(() =>
        expect(mutationSpy.mock.calls[1][0].operation).toMatchObject({
          operationName: 'CoachingDetailActivity',
          variables: {
            dateRange: '2019-12-01..2019-12-31',
          },
        }),
      );

      userEvent.click(next);
      await waitFor(() =>
        expect(mutationSpy.mock.calls[2][0].operation).toMatchObject({
          operationName: 'CoachingDetailActivity',
          variables: {
            dateRange: '2020-01-01..2020-01-31',
          },
        }),
      );
    });

    it('next button is disabled when on the last possible range', () => {
      const { getByRole, getByTestId } = render(<TestComponent />);

      const next = getByRole('button', { name: 'Next' });
      const previous = getByRole('button', { name: 'Previous' });
      const period = getByTestId('ActivityPeriod');

      expect(next).toBeDisabled();

      userEvent.click(previous);
      expect(next).not.toBeDisabled();
      expect(period).toHaveTextContent('Dec 30, 2019 - Jan 5, 2020');

      userEvent.click(next);
      expect(next).toBeDisabled();
      expect(period).toHaveTextContent('Jan 6 - Jan 12');
    });
  });

  it('renders the activity sections', async () => {
    const { findByTestId, getByTestId } = render(<TestComponent />);

    expect(await findByTestId('ActivitySectionContacts')).toHaveTextContent(
      'Contacts20Active22Referrals On-hand21Referrals Gained',
    );
    expect(getByTestId('ActivitySectionAppointments')).toHaveTextContent(
      'Appointments10Completed',
    );
    expect(getByTestId('ActivitySectionCorrespondence')).toHaveTextContent(
      'Correspondence30Pre-call32Support33Thank You31Reminder',
    );
    expect(getByTestId('ActivitySectionPhone')).toHaveTextContent(
      'Phone Calls142Outgoing145Talked To71Appts Produced72Completed70Attempted73Received',
    );
    expect(getByTestId('ActivitySectionElectronic')).toHaveTextContent(
      'Electronic Messages42Sent41Received40Appts ProducedEmail51 Sent / 50 ReceivedFacebook61 Sent / 60 ReceivedText Message81 Sent / 80 Received',
    );
  });

  describe('appeal', () => {
    it('renders when provided', async () => {
      const { findByTestId } = render(<TestComponent />);

      expect(await findByTestId('ActivitySectionAppeal')).toHaveTextContent(
        'Primary Appeal$200 / $1,000Ask$200 (20%) / $500 (50%) / $600 (60%)',
      );
    });

    it('renders a placeholder when missing', async () => {
      const { findByTestId } = render(<TestComponent noAppeal />);

      expect(await findByTestId('ActivitySectionAppeal')).toHaveTextContent(
        'Primary AppealNo Primary Appeal Set$0 (0%) / $0 (0%) / $0 (0%)',
      );
    });
  });

  describe('links', () => {
    it('are hidden when viewing coaching account list', async () => {
      const { findByTestId, queryByRole } = render(<TestComponent />);

      expect(await findByTestId('ActivitySectionContacts')).toBeInTheDocument();
      expect(queryByRole('link')).not.toBeInTheDocument();
    });

    it('are shown when viewing own account list', async () => {
      const { findAllByRole } = render(
        <TestComponent accountListType={AccountListTypeEnum.Own} />,
      );

      expect((await findAllByRole('link')).length).toBeGreaterThan(0);
    });
  });
});
