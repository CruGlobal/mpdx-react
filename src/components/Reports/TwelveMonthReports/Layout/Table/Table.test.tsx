import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import { TwelveMonthReportQuery } from '../../GetTwelveMonthReport.generated';
import { defaultTwelveMonthReport } from '../../TwelveMonthReportMock';
import { TwelveMonthReportTable } from './Table';
import { OrderBy } from './TableHead/TableHead';

const router = {
  query: {
    accountListId: 'account-list-1',
  },
  isReady: true,
  push: jest.fn(),
};
const onRequestSort = jest.fn();
const getContactUrl = jest.fn().mockReturnValue('contact-url');

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
  mocks?: TwelveMonthReportQuery;
  orderBy?: OrderBy | null;
}
const Components: React.FC<ComponentsProps> = ({
  mocks = defaultTwelveMonthReport,
  orderBy = 'name',
}) => (
  <ThemeProvider theme={theme}>
    <TestRouter router={router}>
      <TwelveMonthReportTable
        isExpanded={true}
        order="asc"
        orderBy={orderBy}
        orderedContacts={mocks.twelveMonthReport.currencyGroups[0].contacts}
        salaryCurrency={mocks.twelveMonthReport.currencyGroups[0].currency}
        onRequestSort={onRequestSort}
        getContactUrl={getContactUrl}
        totals={totals}
      />
    </TestRouter>
  </ThemeProvider>
);

describe('TwelveMonthReportTable', () => {
  it('default', async () => {
    const { getAllByTestId, getByRole, queryByTestId } = render(
      <Components orderBy={null} />,
    );

    await waitFor(() => {
      expect(queryByTestId('LoadingTwelveMonthReport')).not.toBeInTheDocument();
    });

    expect(getByRole('table')).toBeInTheDocument();
    expect(getAllByTestId('TwelveMonthReportTableRow')).toHaveLength(2);
    expect(queryByTestId('TwelveMonthReport')).toBeInTheDocument();
    const contactTotal = getAllByTestId('totalGivenByContact');
    expect(contactTotal[0]).toHaveTextContent('3,366');
  });

  it('should order by name', async () => {
    const { getAllByTestId, queryByTestId } = render(<Components />);

    await waitFor(() => {
      expect(queryByTestId('LoadingTwelveMonthReport')).not.toBeInTheDocument();
    });

    const twelveMonthReportRows = getAllByTestId('TwelveMonthReportTableRow');
    expect(twelveMonthReportRows).toHaveLength(2);
    expect(twelveMonthReportRows[0]).toHaveTextContent('test name');
    expect(twelveMonthReportRows[1]).toHaveTextContent('name again');
    expect(queryByTestId('TwelveMonthReport')).toBeInTheDocument();
  });

  it('should should show the dot if a donation is late', async () => {
    const { getAllByTestId, queryByTestId } = render(<Components />);

    await waitFor(() => {
      expect(queryByTestId('LoadingTwelveMonthReport')).not.toBeInTheDocument();
    });

    const twelveMonthReportRows = getAllByTestId('TwelveMonthReportTableRow');
    expect(
      within(twelveMonthReportRows[0]).getByTestId('lateCircle60'),
    ).toBeInTheDocument();

    expect(
      within(twelveMonthReportRows[1]).queryByTestId('lateCircle30'),
    ).not.toBeInTheDocument();
  });

  it('can make contact click event happen and pledge amount is correct', async () => {
    const { getByRole, queryByTestId, getAllByTestId } = render(<Components />);

    await waitFor(() => {
      expect(queryByTestId('LoadingTwelveMonthReport')).not.toBeInTheDocument();
    });

    userEvent.click(getByRole('link', { name: 'name again' }));

    await waitFor(() => {
      expect(getAllByTestId('pledgeAmount')[1]).toHaveTextContent('16 USD');
    });
  });

  it('should calculate the correct monthly totals', async () => {
    const { queryByTestId, getByTestId, getAllByTestId } = render(
      <Components />,
    );

    await waitFor(() => {
      expect(queryByTestId('LoadingTwelveMonthReport')).not.toBeInTheDocument();
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
