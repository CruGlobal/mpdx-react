import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { gqlMock } from '__tests__/util/graphqlMocking';
import {
  ExpectedDonationRowFragment,
  GetExpectedMonthlyTotalsDocument,
  GetExpectedMonthlyTotalsQuery,
  GetExpectedMonthlyTotalsQueryVariables,
} from '../../../../../pages/accountLists/[accountListId]/reports/GetExpectedMonthlyTotals.generated';
import theme from '../../../../theme';
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
  >(GetExpectedMonthlyTotalsDocument, {
    variables: { accountListId: 'abc' },
    mocks: {
      expectedMonthlyTotalReport: {
        received: {
          donations: [
            {
              convertedCurrency: 'USD',
              donationCurrency: 'CAD',
              pledgeCurrency: 'CAD',
              convertedAmount: 175,
              donationAmount: 150.0,
              pledgeAmount: 150.01,
            },
            {
              convertedCurrency: 'USD',
              donationCurrency: 'CAD',
              pledgeCurrency: 'CAD',
              convertedAmount: 176,
              donationAmount: 156.0,
              pledgeAmount: 156.01,
            },
          ],
        },
      },
    },
  });
  const { queryAllByRole, getAllByTestId, getByText, getByTestId } = render(
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

  expect(getByText('CA$150.01')).toBeInTheDocument();
  expect(getByText('$175')).toBeInTheDocument();

  expect(getByTestId('totalPartners')).toHaveTextContent('Show 2 Partners');

  userEvent.click(getByText('Show 2 Partners'));
  expect(getByTestId('totalPartners')).toHaveTextContent('');
});

it('renders non-donation table', async () => {
  const data = gqlMock<
    GetExpectedMonthlyTotalsQuery,
    GetExpectedMonthlyTotalsQueryVariables
  >(GetExpectedMonthlyTotalsDocument, {
    variables: { accountListId: 'abc' },
    mocks: {
      expectedMonthlyTotalReport: {
        likely: {
          donations: [
            {
              convertedCurrency: 'CAD',
              donationCurrency: 'CAD',
              pledgeCurrency: 'CAD',
            },
          ],
        },
      },
    },
  });
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
