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
import { ContactPanelProvider } from 'src/components/common/ContactPanelProvider/ContactPanelProvider';
import theme from 'src/theme';
import { ExpectedMonthlyTotalReportTable } from './ExpectedMonthlyTotalReportTable';

const mockDonation = (mocks?: Partial<ExpectedDonationRowFragment>) =>
  gqlMock<ExpectedDonationRowFragment>(ExpectedDonationRowFragmentDoc, {
    mocks,
  });

interface TestComponentProps {
  data: ExpectedDonationRowFragment[];
  donations?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({
  data,
  donations = true,
}) => {
  return (
    <TestRouter
      router={{
        pathname:
          '/accountLists/[accountListId]/reports/expectedMonthlyTotal/[[...contactId]]',
        query: {
          accountListId: 'abc',
        },
      }}
    >
      <ThemeProvider theme={theme}>
        <ContactPanelProvider>
          <ExpectedMonthlyTotalReportTable
            title="Donations So Far This Month"
            data={data}
            donations={donations}
            total={0}
            currency="USD"
          />
        </ContactPanelProvider>
      </ThemeProvider>
    </TestRouter>
  );
};

describe('ExpectedMonthlyTotalReportTable', () => {
  it('renders empty', async () => {
    const { queryByRole } = render(<TestComponent data={[]} />);

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
      <TestComponent data={[donation1, donation2]} />,
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
      <TestComponent donations={false} data={[donation]} />,
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
      <TestComponent donations={false} data={[donation]} />,
    );

    userEvent.click(await findByRole('button'));
    expect(await findByRole('link', { name: 'John Doe' })).toHaveAttribute(
      'href',
      '/accountLists/abc/reports/expectedMonthlyTotal/contact-1',
    );
  });
});
