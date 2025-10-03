import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, within } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { ContactPanelProvider } from 'src/components/common/ContactPanelProvider/ContactPanelProvider';
import theme from 'src/theme';
import { FourteenMonthReportCurrencyType } from '../../FourteenMonthReport';
import { GetFourteenMonthReportQuery } from '../../GetFourteenMonthReport.generated';
import { useFourteenMonthReport } from '../../useFourteenMonthReport';
import { FourteenMonthReportTable } from './Table';
import { OrderBy } from './TableHead/TableHead';

const reportsSalaryCurrencyDonationsMock = {
  months: ['2018-12', '2019-01', '2019-02', '2019-03'],
  defaultCurrency: 'CAD',
  currencyGroups: {
    CAD: {
      totals: {
        year: '400',
        year_converted: '400',
        months: ['100', '100', '100', '100'],
      },
      donation_infos: [
        {
          contact_id: 'contact-1',
          total: '200',
          complete_months_total: '150',
          average: '50',
          minimum: '25',
          months: [
            {
              total: '150',
              donations: [],
            },
            {
              total: '150',
              donations: [],
            },
            { total: '50', donations: [{ converted_amount: '50' }] },
            { total: 0, donations: [] },
          ],
        },
        {
          contact_id: 'contact-2',
          total: '200',
          complete_months_total: '150',
          average: '50',
          minimum: '25',
          months: [
            {
              total: '50',
              donations: [
                {
                  amount: '50',
                },
              ],
            },
            {
              total: '50',
              donations: [
                {
                  amount: '50',
                },
              ],
            },
          ],
        },
      ],
    },
  },
  donorInfos: [
    {
      contactId: 'contact-1',
      contactName: 'test name',
      accountNumbers: ['11609'],
      lateBy30Days: false,
      lateBy60Days: true,
      pledgeAmount: '100',
      pledgeCurrency: 'CAD',
    },
    {
      contactId: 'contact-2',
      contactName: 'test name',
      accountNumbers: ['11610'],
      lateBy30Days: false,
      lateBy60Days: false,
      pledgeAmount: '99.55',
      pledgeCurrency: 'CAD',
    },
  ],
};

const router = {
  pathname:
    '/accountLists/[accountListId]/reports/salaryCurrency/[[...contactId]]',
  query: {
    accountListId: 'account-list-1',
  },
  isReady: true,
  push: jest.fn(),
};
const onRequestSort = jest.fn();

interface TestComponentProps {
  orderBy?: OrderBy | null;
}

const InnerComponent: React.FC<TestComponentProps> = ({ orderBy }) => {
  const { fourteenMonthReport } = useFourteenMonthReport(
    'account-list-1',
    FourteenMonthReportCurrencyType.Salary,
  );

  const currencyGroup = fourteenMonthReport?.currencyGroups[0];

  if (!currencyGroup) {
    return null;
  }

  return (
    <FourteenMonthReportTable
      isExpanded={true}
      order="asc"
      orderBy={orderBy ?? null}
      orderedContacts={currencyGroup.contacts}
      salaryCurrency={currencyGroup.currency}
      onRequestSort={onRequestSort}
      totals={currencyGroup.totals.months}
    />
  );
};

const TestComponent: React.FC<TestComponentProps> = ({ orderBy = 'name' }) => {
  return (
    <ThemeProvider theme={theme}>
      <TestRouter router={router}>
        <ContactPanelProvider>
          <GqlMockedProvider<{
            GetFourteenMonthReport: GetFourteenMonthReportQuery;
          }>
            mocks={{
              GetFourteenMonthReport: {
                reportsSalaryCurrencyDonations:
                  reportsSalaryCurrencyDonationsMock,
              },
            }}
          >
            <InnerComponent orderBy={orderBy} />
          </GqlMockedProvider>
        </ContactPanelProvider>
      </TestRouter>
    </ThemeProvider>
  );
};

describe('FourteenMonthReportTable', () => {
  it('default', async () => {
    const { getAllByTestId, findByRole, queryByTestId } = render(
      <TestComponent orderBy={null} />,
    );

    expect(await findByRole('table')).toBeInTheDocument();
    const rows = getAllByTestId('FourteenMonthReportTableRow');
    expect(rows).toHaveLength(2);
    expect(queryByTestId('FourteenMonthReport')).toBeInTheDocument();
    const contactTotal = getAllByTestId('totalGivenByContact');
    expect(contactTotal[0]).toHaveTextContent('150');
  });

  it('should order by name', async () => {
    const { findAllByTestId, queryByTestId } = render(<TestComponent />);

    const fourteenMonthReportRows = await findAllByTestId(
      'FourteenMonthReportTableRow',
    );
    expect(fourteenMonthReportRows).toHaveLength(2);
    expect(fourteenMonthReportRows[0]).toHaveTextContent('test name');
    expect(fourteenMonthReportRows[1]).toHaveTextContent('test name');
    expect(queryByTestId('FourteenMonthReport')).toBeInTheDocument();
  });

  it('should show late indicators when contacts are late', async () => {
    const { findAllByTestId } = render(<TestComponent />);

    const fourteenMonthReportRows = await findAllByTestId(
      'FourteenMonthReportTableRow',
    );
    expect(
      within(fourteenMonthReportRows[0]).getByTestId('lateCircle60'),
    ).toBeInTheDocument();
  });

  it('can make contact click event happen and pledge amount is correct', async () => {
    const { findAllByTestId } = render(<TestComponent />);

    const links = await findAllByTestId('totalGivenByContact');
    expect(links[1]).toHaveTextContent('150');

    const pledgeAmounts = await findAllByTestId('pledgeAmount');
    expect(pledgeAmounts[1]).toHaveTextContent('100 CAD');
  });

  it('should calculate the correct monthly totals', async () => {
    const { findAllByTestId, getByTestId, getAllByTestId } = render(
      <TestComponent />,
    );

    const contactTotal = await findAllByTestId('monthlyTotals');
    expect(contactTotal[0]).toHaveTextContent('100');
    expect(contactTotal[1]).toHaveTextContent('100');
    expect(contactTotal[2]).toHaveTextContent('100');
    expect(contactTotal[3]).toHaveTextContent('100');
    expect(getByTestId('averageTotal')).toHaveTextContent('100');
    expect(getByTestId('minimumTotal')).toHaveTextContent('50');
    expect(getAllByTestId('overallTotal')[0]).toHaveTextContent('300');
  });
});
