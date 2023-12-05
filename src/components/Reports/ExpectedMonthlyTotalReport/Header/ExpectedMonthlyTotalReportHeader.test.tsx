import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { gqlMock } from '../../../../../__tests__/util/graphqlMocking';
import {
  GetExpectedMonthlyTotalsDocument,
  GetExpectedMonthlyTotalsQuery,
  GetExpectedMonthlyTotalsQueryVariables,
} from '../../../../../pages/accountLists/[accountListId]/reports/GetExpectedMonthlyTotals.generated';
import theme from '../../../../theme';
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
  const { queryByTestId } = render(
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

  expect(queryByTestId('progressBarWrapper')).not.toBeInTheDocument();
});
