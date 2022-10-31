import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../../../theme';
import {
  GetExpectedMonthlyTotalsDocument,
  GetExpectedMonthlyTotalsQuery,
  GetExpectedMonthlyTotalsQueryVariables,
} from '../../../../../pages/accountLists/[accountListId]/reports/GetExpectedMonthlyTotals.generated';
import { gqlMock } from '../../../../../__tests__/util/graphqlMocking';
import { ExpectedMonthlyTotalReportHeader } from './ExpectedMonthlyTotalReportHeader';

it('renders with data', () => {
  const data = gqlMock<
    GetExpectedMonthlyTotalsQuery,
    GetExpectedMonthlyTotalsQueryVariables
  >(GetExpectedMonthlyTotalsDocument, { variables: { accountListId: 'abc' } });

  const { getByTestId } = render(
    <ThemeProvider theme={theme}>
      <ExpectedMonthlyTotalReportHeader
        empty={false}
        totalDonations={data.expectedMonthlyTotalReport.received.total}
        totalLikely={data.expectedMonthlyTotalReport.likely.total}
        totalUnlikely={data.expectedMonthlyTotalReport.unlikely.total}
        total={1000}
        currency={data.expectedMonthlyTotalReport.currency || ''}
      />
    </ThemeProvider>,
  );

  expect(getByTestId('progressBarWrapper')).toBeInTheDocument();
});

it('renders empty', () => {
  const { getByText, queryByTestId } = render(
    <ThemeProvider theme={theme}>
      <ExpectedMonthlyTotalReportHeader
        empty={true}
        totalDonations={0}
        totalLikely={0}
        totalUnlikely={0}
        total={0}
        currency={''}
      />
    </ThemeProvider>,
  );
  expect(getByText('Expected Monthly Total')).toBeInTheDocument();

  expect(queryByTestId('progressBarWrapper')).not.toBeInTheDocument();
});
