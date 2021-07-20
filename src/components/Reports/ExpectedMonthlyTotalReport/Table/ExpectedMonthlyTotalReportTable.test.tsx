import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@material-ui/core';
import theme from '../../../../theme';
import {
  ExpectedDonationRowFragment,
  GetExpectedMonthlyTotalsDocument,
  GetExpectedMonthlyTotalsQuery,
  GetExpectedMonthlyTotalsQueryVariables,
} from '../../../../../pages/accountLists/[accountListId]/reports/GetExpectedMonthlyTotals.generated';
import { gqlMock } from '../../../../../__tests__/util/graphqlMocking';
import { ExpectedMonthlyTotalReportTable } from './ExpectedMonthlyTotalReportTable';

it('renders empty', async () => {
  const empty: ExpectedDonationRowFragment[] = [];
  const { queryByRole } = render(
    <ThemeProvider theme={theme}>
      <ExpectedMonthlyTotalReportTable
        accountListId={'abc'}
        title={'Donations So Far This Month'}
        data={empty}
        donations={true}
        total={0}
        currency={'USD'}
      />
    </ThemeProvider>,
  );

  expect(queryByRole('button')).not.toBeInTheDocument();
});

it('renders with data', async () => {
  const data = gqlMock<
    GetExpectedMonthlyTotalsQuery,
    GetExpectedMonthlyTotalsQueryVariables
  >(GetExpectedMonthlyTotalsDocument, { variables: { accountListId: 'abc' } });

  const { queryAllByRole, getAllByTestId } = render(
    <ThemeProvider theme={theme}>
      <ExpectedMonthlyTotalReportTable
        accountListId={'abc'}
        title={'Donations So Far This Month'}
        data={data.expectedMonthlyTotalReport.received.donations}
        donations={true}
        total={0}
        currency={'USD'}
      />
    </ThemeProvider>,
  );

  expect(queryAllByRole('button')[0]).toBeInTheDocument();

  expect(getAllByTestId('donationRow')[0]).toBeInTheDocument();
});
