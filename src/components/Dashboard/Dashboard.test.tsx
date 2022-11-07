import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { SnackbarProvider } from 'notistack';
import { ThemeProvider } from '@mui/material/styles';
import matchMediaMock from '../../../__tests__/util/matchMediaMock';
import { GetDashboardQuery } from '../../../pages/accountLists/GetDashboard.generated';
import theme from '../../theme';
import useTaskModal from '../../hooks/useTaskModal';
import { GetThisWeekDefaultMocks } from './ThisWeek/ThisWeek.mock';
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
  });
});

const data: GetDashboardQuery = {
  user: {
    firstName: 'Roger',
  },
  accountList: {
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
});
