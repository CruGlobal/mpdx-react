import { ThemeProvider } from '@emotion/react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Settings } from 'luxon';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
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
      contactsByStatus: {
        appointmentScheduled: 7,
        callForDecision: 6,
        connectionsRemaining: 25,
        contactForAppointment: 6,
        cultivate: 7,
        financial: 9,
        future: 7,
        initiations: 19,
        neverContacted: 11,
        prayer: 7,
        special: 7,
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

      expect(getByTestId('ActivityPeriod')).toHaveTextContent('Jan 5 - Jan 11');
      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation('CoachingDetailActivity', {
          dateRange: '2020-01-05..2020-01-11',
        }),
      );
    });

    it('is a month long when in monthly mode', async () => {
      const { getByTestId } = render(
        <TestComponent period={CoachingPeriodEnum.Monthly} />,
      );

      expect(getByTestId('ActivityPeriod')).toHaveTextContent('Jan 1 - Jan 31');
      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation('CoachingDetailActivity', {
          dateRange: '2020-01-01..2020-01-31',
        }),
      );
    });

    it('shows the year when in a different year', () => {
      const { getByRole, getByTestId } = render(<TestComponent />);

      userEvent.click(getByRole('button', { name: 'Previous' }));
      expect(getByTestId('ActivityPeriod')).toHaveTextContent(
        'Dec 29, 2019 - Jan 4, 2020',
      );
    });

    it('resets when the period changes', () => {
      const { getByRole, getByTestId, rerender } = render(
        <TestComponent period={CoachingPeriodEnum.Monthly} />,
      );

      userEvent.click(getByRole('button', { name: 'Previous' }));
      rerender(<TestComponent />);
      expect(getByTestId('ActivityPeriod')).toHaveTextContent('Jan 5 - Jan 11');
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
            dateRange: '2019-12-29..2020-01-04',
          },
        }),
      );

      userEvent.click(next);
      await waitFor(() =>
        expect(mutationSpy.mock.calls[2][0].operation).toMatchObject({
          operationName: 'CoachingDetailActivity',
          variables: {
            dateRange: '2020-01-05..2020-01-11',
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
      expect(period).toHaveTextContent('Dec 29, 2019 - Jan 4, 2020');

      userEvent.click(next);
      expect(next).toBeDisabled();
      expect(period).toHaveTextContent('Jan 5 - Jan 11');
    });
  });

  it('renders the activity sections', async () => {
    const { getByTestId } = render(<TestComponent />);

    await waitFor(() =>
      expect(getByTestId('CurrentRealityPartnerFinancial')).toHaveTextContent(
        'Financial Partners',
      ),
    );
    await waitFor(() =>
      expect(getByTestId('CurrentRealityPartnerFinancial')).toHaveTextContent(
        '9',
      ),
    );
    expect(getByTestId('CurrentRealityPartnerSpecial')).toHaveTextContent(
      'Special Gift Partners',
    );
    expect(getByTestId('CurrentRealityPartnerSpecial')).toHaveTextContent('7');

    expect(getByTestId('CurrentRealityPartnerPrayer')).toHaveTextContent(
      'Prayer Partners',
    );
    expect(getByTestId('CurrentRealityPartnerPrayer')).toHaveTextContent('7');

    expect(getByTestId('CurrentRealityConnections')).toHaveTextContent(
      'Connections Remaining',
    );
    expect(getByTestId('CurrentRealityConnections')).toHaveTextContent('25');

    expect(getByTestId('CurrentRealityPartnerInitiations')).toHaveTextContent(
      'Partners Currently Initiating With',
    );
    expect(getByTestId('CurrentRealityPartnerInitiations')).toHaveTextContent(
      '19',
    );
  });

  describe('appeal', () => {
    it('renders when provided', async () => {
      const { getByTestId } = render(<TestComponent />);

      await waitFor(() =>
        expect(getByTestId('ActivitySectionAppeal')).toHaveTextContent(
          'Primary Appeal$200 / $1,000Ask$200 (20%) / $500 (50%) / $600 (60%)',
        ),
      );
    });

    it('renders a placeholder when missing', async () => {
      const { getByTestId } = render(<TestComponent noAppeal />);

      await waitFor(() =>
        expect(getByTestId('ActivitySectionAppeal')).toHaveTextContent(
          'Primary AppealNo Primary Appeal Set$0 (0%) / $0 (0%) / $0 (0%)',
        ),
      );
    });
  });

  describe('links', () => {
    const connectionsRemainingLinkText =
      mocks.CoachingDetailActivity.accountListAnalytics.contactsByStatus.connectionsRemaining.toString();

    it('are hidden when viewing coaching account list', async () => {
      const { findByTestId, queryByRole } = render(<TestComponent />);

      expect(
        await findByTestId('CurrentRealityConnections'),
      ).toBeInTheDocument();
      expect(
        queryByRole('link', { name: connectionsRemainingLinkText }),
      ).not.toBeInTheDocument();
    });

    it('are shown when viewing own account list', async () => {
      const { findByRole } = render(
        <TestComponent accountListType={AccountListTypeEnum.Own} />,
      );
      expect(
        await findByRole('link', { name: connectionsRemainingLinkText }),
      ).toBeInTheDocument();
    });
  });
});
