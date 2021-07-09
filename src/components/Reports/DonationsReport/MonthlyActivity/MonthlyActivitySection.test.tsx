import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@material-ui/core';
import theme from '../../../../theme';
import { MonthlyActivitySection } from './MonthlyActivitySection';
import { GetDashboardQuery } from 'pages/accountLists/GetDashboard.generated';

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
    ],
    averageIgnoreCurrent: 750,
  },
};

it('renders', () => {
  const { getByText } = render(
    <ThemeProvider theme={theme}>
      <MonthlyActivitySection data={data} />
    </ThemeProvider>,
  );

  expect(getByText('Monthly Activity')).toBeInTheDocument();
});
