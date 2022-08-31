import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@mui/material';
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

it('renders donation table', async () => {
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

  expect(getAllByTestId('donationColumn')[0]).toBeInTheDocument();
});

it('renders non-donation table', async () => {
  const data = gqlMock<
    GetExpectedMonthlyTotalsQuery,
    GetExpectedMonthlyTotalsQueryVariables
  >(GetExpectedMonthlyTotalsDocument, { variables: { accountListId: 'abc' } });

  const { queryAllByRole, queryByTestId } = render(
    <ThemeProvider theme={theme}>
      <ExpectedMonthlyTotalReportTable
        accountListId={'abc'}
        title={'Likely Partners This Month'}
        data={data.expectedMonthlyTotalReport.likely.donations}
        donations={false}
        total={0}
        currency={'USD'}
      />
    </ThemeProvider>,
  );

  expect(queryAllByRole('button')[0]).toBeInTheDocument();

  expect(queryByTestId('donationColumn')).not.toBeInTheDocument();
});
