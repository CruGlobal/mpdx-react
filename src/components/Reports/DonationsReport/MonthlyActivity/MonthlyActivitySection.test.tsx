import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material';
import { DateTime } from 'luxon';
import theme from '../../../../theme';
import { GetDonationGraphQuery } from '../GetDonationGraph.generated';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import { MonthlyActivitySection } from './MonthlyActivitySection';

it('renders with data', async () => {
  const mocks = {
    GetDonationGraph: {
      accountList: {
        currency: 'CAD',
        monthlyGoal: 100,
        totalPledges: 10,
      },
      reportsDonationHistories: {
        averageIgnoreCurrent: 10,
        periods: [
          {
            startDate: DateTime.now().minus({ months: 12 }).toISO(),
            convertedTotal: 10,
            totals: [
              {
                currency: 'CAD',
                convertedAmount: 10,
              },
            ],
          },
          {
            startDate: DateTime.now().minus({ months: 11 }).toISO(),
            convertedTotal: 10,
            totals: [
              {
                currency: 'CAD',
                convertedAmount: 10,
              },
            ],
          },
        ],
      },
    },
  };

  const { getByTestId, queryByRole, queryByTestId } = render(
    <ThemeProvider theme={theme}>
      <GqlMockedProvider<GetDonationGraphQuery> mocks={mocks}>
        <MonthlyActivitySection accountListId={'abc'} />
      </GqlMockedProvider>
    </ThemeProvider>,
  );

  await waitFor(() =>
    expect(queryByRole('progressbar')).not.toBeInTheDocument(),
  );
  expect(getByTestId('DonationHistoriesTypographyAverage')).toBeInTheDocument();
  expect(queryByTestId('DonationHistoriesGridLoading')).not.toBeInTheDocument();
});

it('renders empty', async () => {
  const mocks = {
    GetDonationGraph: {
      accountList: {
        currency: 'CAD',
        monthlyGoal: 0,
        totalPledges: 0,
      },
      reportsDonationHistories: {
        averageIgnoreCurrent: 0,
        periods: [
          {
            startDate: DateTime.now().minus({ months: 12 }).toISO(),
            convertedTotal: 0,
            totals: [
              {
                currency: 'CAD',
                convertedAmount: 0,
              },
            ],
          },
          {
            startDate: DateTime.now().minus({ months: 11 }).toISO(),
            convertedTotal: 0,
            totals: [
              {
                currency: 'CAD',
                convertedAmount: 0,
              },
            ],
          },
        ],
      },
    },
  };

  const { queryByText, queryByRole, getByTestId } = render(
    <ThemeProvider theme={theme}>
      <GqlMockedProvider<GetDonationGraphQuery> mocks={mocks}>
        <MonthlyActivitySection accountListId={'abc'} />
      </GqlMockedProvider>
    </ThemeProvider>,
  );

  await waitFor(() =>
    expect(queryByRole('progressbar')).not.toBeInTheDocument(),
  );
  expect(getByTestId('DonationHistoriesBoxEmpty')).toBeInTheDocument();
  expect(queryByText('Average')).not.toBeInTheDocument();
});
