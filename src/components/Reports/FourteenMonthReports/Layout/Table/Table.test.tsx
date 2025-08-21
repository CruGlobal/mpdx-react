import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor, within } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import { ContactPanelProvider } from 'src/components/common/ContactPanelProvider/ContactPanelProvider';
import theme from 'src/theme';
import { defaultFourteenMonthReport } from '../../FourteenMonthReportMock';
import { FourteenMonthReportQuery } from '../../GetFourteenMonthReport.generated';
import { FourteenMonthReportTable } from './Table';
import { OrderBy } from './TableHead/TableHead';

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

const totals = [
  {
    month: '2020-10-01',
    total: 1836.32,
  },
  {
    month: '2020-11-01',
    total: 1486.99,
  },
  {
    month: '2020-12-01',
    total: 1836.32,
  },
  {
    month: '2021-1-01',
    total: 1836.32,
  },
];

interface ComponentsProps {
  mocks?: FourteenMonthReportQuery;
  orderBy?: OrderBy | null;
}
const Components: React.FC<ComponentsProps> = ({
  mocks = defaultFourteenMonthReport,
  orderBy = 'name',
}) => (
  <ThemeProvider theme={theme}>
    <TestRouter router={router}>
      <ContactPanelProvider>
        <FourteenMonthReportTable
          isExpanded={true}
          order="asc"
          orderBy={orderBy}
          orderedContacts={mocks.fourteenMonthReport.currencyGroups[0].contacts}
          salaryCurrency={mocks.fourteenMonthReport.currencyGroups[0].currency}
          onRequestSort={onRequestSort}
          totals={totals}
        />
      </ContactPanelProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('FourteenMonthReportTable', () => {
  it('default', async () => {
    const { getAllByTestId, getByRole, queryByTestId } = render(
      <Components orderBy={null} />,
    );

    await waitFor(() => {
      expect(
        queryByTestId('LoadingFourteenMonthReport'),
      ).not.toBeInTheDocument();
    });

    expect(getByRole('table')).toBeInTheDocument();
    expect(getAllByTestId('FourteenMonthReportTableRow')).toHaveLength(2);
    expect(queryByTestId('FourteenMonthReport')).toBeInTheDocument();
    const contactTotal = getAllByTestId('totalGivenByContact');
    expect(contactTotal[0]).toHaveTextContent('1,020');
  });

  it('should order by name', async () => {
    const { getAllByTestId, queryByTestId } = render(<Components />);

    await waitFor(() => {
      expect(
        queryByTestId('LoadingFourteenMonthReport'),
      ).not.toBeInTheDocument();
    });

    const fourteenMonthReportRows = getAllByTestId(
      'FourteenMonthReportTableRow',
    );
    expect(fourteenMonthReportRows).toHaveLength(2);
    expect(fourteenMonthReportRows[0]).toHaveTextContent('test name');
    expect(fourteenMonthReportRows[1]).toHaveTextContent('name again');
    expect(queryByTestId('FourteenMonthReport')).toBeInTheDocument();
  });

  it('should should show the dot if a donation is late', async () => {
    const { getAllByTestId, queryByTestId } = render(<Components />);

    await waitFor(() => {
      expect(
        queryByTestId('LoadingFourteenMonthReport'),
      ).not.toBeInTheDocument();
    });

    const fourteenMonthReportRows = getAllByTestId(
      'FourteenMonthReportTableRow',
    );
    expect(
      within(fourteenMonthReportRows[0]).getByTestId('lateCircle60'),
    ).toBeInTheDocument();

    expect(
      within(fourteenMonthReportRows[1]).queryByTestId('lateCircle30'),
    ).not.toBeInTheDocument();
  });

  it('can make contact click event happen and pledge amount is correct', async () => {
    const { getByRole, queryByTestId, getAllByTestId } = render(<Components />);

    await waitFor(() => {
      expect(
        queryByTestId('LoadingFourteenMonthReport'),
      ).not.toBeInTheDocument();
    });

    expect(getByRole('link', { name: 'name again' })).toHaveAttribute(
      'href',
      '/accountLists/account-list-1/reports/salaryCurrency/contact-2',
    );

    await waitFor(() => {
      expect(getAllByTestId('pledgeAmount')[1]).toHaveTextContent('16 USD');
    });
  });

  it('should calculate the correct monthly totals', async () => {
    const { queryByTestId, getByTestId, getAllByTestId } = render(
      <Components />,
    );

    await waitFor(() => {
      expect(
        queryByTestId('LoadingFourteenMonthReport'),
      ).not.toBeInTheDocument();
    });

    const contactTotal = getAllByTestId('monthlyTotals');
    expect(contactTotal[0]).toHaveTextContent('1,836');
    expect(contactTotal[1]).toHaveTextContent('1,487');
    expect(contactTotal[2]).toHaveTextContent('1,836');
    expect(contactTotal[3]).toHaveTextContent('1,836');

    expect(getByTestId('averageTotal')).toHaveTextContent('516');
    expect(getByTestId('minimumTotal')).toHaveTextContent('510');
    expect(getAllByTestId('overallTotal')[0]).toHaveTextContent('6,996');
  });
});
