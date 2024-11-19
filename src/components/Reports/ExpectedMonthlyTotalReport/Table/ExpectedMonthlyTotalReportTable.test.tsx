import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { gqlMock } from '__tests__/util/graphqlMocking';
import {
  ExpectedDonationRowFragment,
  ExpectedDonationRowFragmentDoc,
} from 'pages/accountLists/[accountListId]/reports/GetExpectedMonthlyTotals.generated';
import theme from 'src/theme';
import { ExpectedMonthlyTotalReportTable } from './ExpectedMonthlyTotalReportTable';

const mockDonation = (mocks?: Partial<ExpectedDonationRowFragment>) =>
  gqlMock<ExpectedDonationRowFragment>(ExpectedDonationRowFragmentDoc, {
    mocks,
  });

describe('ExpectedMonthlyTotalReportTable', () => {
  it('renders empty', async () => {
    const empty: ExpectedDonationRowFragment[] = [];
    const { queryByRole } = render(
      <TestRouter>
        <ThemeProvider theme={theme}>
          <ExpectedMonthlyTotalReportTable
            accountListId={'abc'}
            title={'Donations So Far This Month'}
            data={empty}
            donations={true}
            total={0}
            currency={'USD'}
          />
        </ThemeProvider>
      </TestRouter>,
    );

    expect(queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders donation table', async () => {
    const donation1 = mockDonation({
      convertedCurrency: 'USD',
      pledgeCurrency: 'CAD',
      convertedAmount: 175,
      donationAmount: 150.0,
      pledgeAmount: 150.01,
    });
    const donation2 = mockDonation({
      convertedCurrency: 'USD',
      pledgeCurrency: 'CAD',
      convertedAmount: 176,
      donationAmount: 156.0,
      pledgeAmount: 156.01,
    });

    const { queryAllByRole, getAllByTestId, getByText, getByTestId } = render(
      <TestRouter>
        <ThemeProvider theme={theme}>
          <ExpectedMonthlyTotalReportTable
            accountListId={'abc'}
            title={'Donations So Far This Month'}
            data={[donation1, donation2]}
            donations={true}
            total={0}
            currency={'USD'}
          />
        </ThemeProvider>
      </TestRouter>,
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
    const donation = mockDonation();

    const { queryAllByRole, queryByTestId } = render(
      <TestRouter>
        <ThemeProvider theme={theme}>
          <ExpectedMonthlyTotalReportTable
            accountListId={'abc'}
            title={'Likely Partners This Month'}
            data={[donation]}
            donations={false}
            total={0}
            currency={'USD'}
          />
        </ThemeProvider>
      </TestRouter>,
    );

    expect(queryAllByRole('button')[0]).toBeInTheDocument();

    expect(queryByTestId('donationColumn')).not.toBeInTheDocument();
  });

  it('links to contacts', async () => {
    const donation = mockDonation({
      contactId: 'contact-1',
      contactName: 'John Doe',
    });

    const { findByRole } = render(
      <TestRouter>
        <ThemeProvider theme={theme}>
          <ExpectedMonthlyTotalReportTable
            accountListId={'abc'}
            title={'Likely Partners This Month'}
            data={[donation]}
            donations={false}
            total={0}
            currency={'USD'}
          />
        </ThemeProvider>
      </TestRouter>,
    );

    userEvent.click(await findByRole('button'));
    expect(await findByRole('link', { name: 'John Doe' })).toHaveAttribute(
      'href',
      '/accountLists/abc/reports/expectedMonthlyTotal/contact-1',
    );
  });
});
