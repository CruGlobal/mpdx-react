import React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import matchMediaMock from '__tests__/util/matchMediaMock';
import {
  afterTestResizeObserver,
  beforeTestResizeObserver,
} from '__tests__/util/windowResizeObserver';
import { GetDashboardQuery } from 'pages/accountLists/GetDashboard.generated';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import { UsStaffGroupEnum, UserTypeEnum } from 'src/graphql/types.generated';
import { UserOptionQuery } from 'src/hooks/UserPreference.generated';
import useTaskModal from '../../hooks/useTaskModal';
import theme from '../../theme';
import { NewStaffGoalReadyQuery } from './NewStaffGoalReadyCard/NewStaffGoalReadyCard.generated';
import {
  GetThisWeekDefaultMocks,
  getUserOptionMock,
} from './ThisWeek/ThisWeek.mock';
import Dashboard from '.';

jest.mock('../../hooks/useTaskModal');
jest.mock('next/router', () => ({
  useRouter: () => {
    return {
      query: { accountListId: 'abc' },
      isReady: true,
    };
  },
}));

beforeEach(() => {
  (useTaskModal as jest.Mock).mockReturnValue({
    openTaskModal: jest.fn(),
    preloadTaskModal: jest.fn(),
  });
});

const data: GetDashboardQuery = {
  user: {
    id: '123',
    firstName: 'Roger',
    userType: UserTypeEnum.UsStaff,
  },
  accountList: {
    id: '1',
    name: 'My Account List',
    monthlyGoal: 1000,
    receivedPledges: 400,
    totalPledges: 700,
    currency: 'NZD',
    balance: 1000,
  },
  contacts: {
    totalCount: 15,
  },
  reportsDonationHistories: {
    periods: [
      {
        convertedTotal: 200,
        startDate: '2011-12-1',
        totals: [
          {
            currency: 'USD',
            convertedAmount: 350,
          },
        ],
      },
      {
        convertedTotal: 400,
        startDate: '2012-1-1',
        totals: [
          {
            currency: 'USD',
            convertedAmount: 750,
          },
        ],
      },
      {
        convertedTotal: 900,
        startDate: '2012-2-1',
        totals: [
          {
            currency: 'USD',
            convertedAmount: 550,
          },
          {
            currency: 'NZD',
            convertedAmount: 400,
          },
          {
            currency: 'CAD',
            convertedAmount: 200,
          },
          {
            currency: 'AUD',
            convertedAmount: 100,
          },
        ],
      },
      {
        convertedTotal: 1100,
        startDate: '2012-3-1',
        totals: [
          {
            currency: 'USD',
            convertedAmount: 950,
          },
          {
            currency: 'NZD',
            convertedAmount: 800,
          },
          {
            currency: 'CAD',
            convertedAmount: 300,
          },
          {
            currency: 'AUD',
            convertedAmount: 200,
          },
          {
            currency: 'HKD',
            convertedAmount: 100,
          },
        ],
      },
    ],
    averageIgnoreCurrent: 750,
  },
};

describe('Dashboard', () => {
  beforeEach(() => {
    matchMediaMock({ width: '1024px' });
    beforeTestResizeObserver();
  });

  afterEach(() => {
    afterTestResizeObserver();
  });

  it('prompts new staff whose MPD goal has been sent', async () => {
    const { findByRole } = render(
      <ThemeProvider theme={theme}>
        <SnackbarProvider>
          <GqlMockedProvider<{
            GetUser: GetUserQuery;
            NewStaffGoalReady: NewStaffGoalReadyQuery;
            UserOption: UserOptionQuery;
          }>
            mocks={{
              GetUser: { user: { usStaffGroup: UsStaffGroupEnum.NewStaff } },
              // Answered by key: the verified user group keeps the confirm modal
              // closed, and the card's acknowledgement is deliberately unset.
              UserOption: {
                userOption: ((_root: unknown, args: { key: string }) =>
                  args.key === 'user_type_verified'
                    ? { key: args.key, value: 'true' }
                    : null) as unknown as NonNullable<
                  UserOptionQuery['userOption']
                >,
              },
              NewStaffGoalReady: {
                newStaffGoalCalculation: {
                  id: 'goal-1',
                  calculations: {
                    monthlyGoal: 4602.66,
                    specialNeedsTotal: 2500,
                  },
                  newStaffCohortAttendee: null,
                },
              },
            }}
          >
            <Dashboard accountListId="abc" data={data} />
          </GqlMockedProvider>
        </SnackbarProvider>
      </ThemeProvider>,
    );

    // Three chained requests (user, goal, acknowledgement) feed the card, so
    // allow longer than the default wait.
    expect(
      await findByRole(
        'heading',
        { name: 'Your MPD goal is ready' },
        { timeout: 5000 },
      ),
    ).toBeInTheDocument();
  });

  it('default', async () => {
    const { getByTestId, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <SnackbarProvider>
          <MockedProvider mocks={GetThisWeekDefaultMocks()} addTypename={false}>
            <Dashboard accountListId="abc" data={data} />
          </MockedProvider>
        </SnackbarProvider>
      </ThemeProvider>,
    );
    await waitFor(() =>
      expect(
        queryByTestId('PartnerCarePrayerListLoading'),
      ).not.toBeInTheDocument(),
    );
    expect(getByTestId('MonthlyGoalTypographyGoal').textContent).toEqual(
      'NZ$1,000',
    );
    expect(getByTestId('MonthlyGoalTypographyPledged').textContent).toEqual(
      'NZ$700',
    );
    expect(getByTestId('MonthlyGoalTypographyReceived').textContent).toEqual(
      'NZ$400',
    );
    expect(getByTestId('BalanceTypography').textContent).toEqual('NZ$1,000');
    expect(getByTestId('DonationHistoriesTypographyGoal').textContent).toEqual(
      'Goal NZ$1,000',
    );
    expect(
      getByTestId('DonationHistoriesTypographyAverage').textContent,
    ).toEqual('Average NZ$750');
    expect(
      getByTestId('DonationHistoriesTypographyPledged').textContent,
    ).toEqual('Committed NZ$700');
    expect(getByTestId('PartnerCarePrayerList')).toBeInTheDocument();
    expect(getByTestId('TasksDueThisWeekList')).toBeInTheDocument();
    expect(getByTestId('LateCommitmentsListContacts')).toBeInTheDocument();
    expect(getByTestId('ReferralsTabRecentList')).toBeInTheDocument();
    expect(getByTestId('AppealsBoxName')).toBeInTheDocument();
  });

  it('handles null fields', async () => {
    const { getByTestId, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <SnackbarProvider>
          <MockedProvider mocks={GetThisWeekDefaultMocks()} addTypename={false}>
            <Dashboard
              accountListId="abc"
              data={{
                ...data,
                accountList: {
                  ...data.accountList,
                  monthlyGoal: null,
                  currency: 'USD',
                },
              }}
            />
          </MockedProvider>
        </SnackbarProvider>
      </ThemeProvider>,
    );
    await waitFor(() =>
      expect(
        queryByTestId('PartnerCarePrayerListLoading'),
      ).not.toBeInTheDocument(),
    );
    expect(getByTestId('MonthlyGoalTypographyGoal').textContent).toEqual('$0');
    expect(getByTestId('MonthlyGoalTypographyPledged').textContent).toEqual(
      '$700',
    );
    expect(getByTestId('MonthlyGoalTypographyReceived').textContent).toEqual(
      '$400',
    );
    expect(getByTestId('BalanceTypography').textContent).toEqual('$1,000');
    expect(
      queryByTestId('DonationHistoriesTypographyGoal'),
    ).not.toBeInTheDocument();
    expect(
      getByTestId('DonationHistoriesTypographyAverage').textContent,
    ).toEqual('Average $750');
    expect(
      getByTestId('DonationHistoriesTypographyPledged').textContent,
    ).toEqual('Committed $700');
  });

  describe('ConfirmUserGroupModal', () => {
    it('renders ConfirmUserGroupModal when user type is not verified', async () => {
      const { getByText } = render(
        <ThemeProvider theme={theme}>
          <SnackbarProvider>
            <MockedProvider
              mocks={GetThisWeekDefaultMocks()}
              addTypename={false}
            >
              <Dashboard accountListId="abc" data={data} />
            </MockedProvider>
          </SnackbarProvider>
        </ThemeProvider>,
      );

      await waitFor(() => {
        expect(getByText('Is this your user group?')).toBeInTheDocument();
      });
    });

    it('does not render ConfirmUserGroupModal when user type is verified', async () => {
      const { queryByText } = render(
        <ThemeProvider theme={theme}>
          <SnackbarProvider>
            <MockedProvider
              mocks={[
                ...GetThisWeekDefaultMocks().filter(
                  (mock) =>
                    mock.request.variables?.key !== 'user_type_verified',
                ),
                getUserOptionMock('true'),
              ]}
              addTypename={false}
            >
              <Dashboard accountListId="abc" data={data} />
            </MockedProvider>
          </SnackbarProvider>
        </ThemeProvider>,
      );

      await waitFor(() => {
        expect(queryByText('Is this your user group?')).not.toBeInTheDocument();
      });
    });
  });
});
