import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../../theme';
import { GetExpectedMonthlyTotalsQuery } from '../../../../pages/accountLists/[accountListId]/reports/GetExpectedMonthlyTotals.generated';
import { GqlMockedProvider } from '../../../../__tests__/util/graphqlMocking';
import { ExpectedMonthlyTotalReport } from './ExpectedMonthlyTotalReport';
import TestRouter from '__tests__/util/TestRouter';

const router = {
  query: { accountListId: 'aaa' },
  isReady: true,
};

it('renders with data', async () => {
  const { getAllByTestId, queryByRole, queryAllByRole } = render(
    <ThemeProvider theme={theme}>
      <GqlMockedProvider<GetExpectedMonthlyTotalsQuery>>
        <ExpectedMonthlyTotalReport accountListId={'abc'} />
      </GqlMockedProvider>
    </ThemeProvider>,
  );

  await waitFor(() =>
    expect(queryByRole('progressbar')).not.toBeInTheDocument(),
  );

  expect(queryAllByRole('button')[0]).toBeInTheDocument();

  expect(getAllByTestId('donationColumn')[0]).toBeInTheDocument();
});

it('renders empty', async () => {
  const mocks = {
    GetExpectedMonthlyTotals: {
      expectedMonthlyTotalReport: {
        received: {
          donations: [],
        },
        likely: {
          donations: [],
        },
        unlikely: {
          donations: [],
        },
      },
    },
  };

  const { getByText, queryByRole } = render(
    <ThemeProvider theme={theme}>
      <TestRouter router={router}>
        <GqlMockedProvider<GetExpectedMonthlyTotalsQuery> mocks={mocks}>
          <ExpectedMonthlyTotalReport accountListId={'abc'} />
        </GqlMockedProvider>
      </TestRouter>
    </ThemeProvider>,
  );

  await waitFor(() =>
    expect(queryByRole('progressbar')).not.toBeInTheDocument(),
  );

  expect(
    getByText('You have no expected donations this month'),
  ).toBeInTheDocument();
});
