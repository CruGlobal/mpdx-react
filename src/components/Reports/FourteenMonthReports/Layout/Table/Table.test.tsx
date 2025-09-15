import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor, within } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import { ContactPanelProvider } from 'src/components/common/ContactPanelProvider/ContactPanelProvider';
import theme from 'src/theme';
import { defaultFourteenMonthReport } from '../../FourteenMonthReportMock';
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

const getTotals = (mocks: typeof defaultFourteenMonthReport) =>
  mocks.currencyGroups[0].totals.months;

interface ComponentsProps {
  mocks?: typeof defaultFourteenMonthReport;
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
          orderedContacts={mocks.currencyGroups[0].contacts}
          salaryCurrency={mocks.currencyGroups[0].currency}
          onRequestSort={onRequestSort}
          totals={getTotals(mocks)}
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
      expect(queryByTestId('Loading')).not.toBeInTheDocument();
    });

    expect(getByRole('table')).toBeInTheDocument();
    expect(getAllByTestId('FourteenMonthReportTableRow')).toHaveLength(2);
    expect(queryByTestId('FourteenMonthReport')).toBeInTheDocument();
    const contactTotal = getAllByTestId('totalGivenByContact');
    expect(contactTotal[0]).toHaveTextContent('150');
  });

  it('should order by name', async () => {
    const { getAllByTestId, queryByTestId } = render(<Components />);

    await waitFor(() => {
      expect(queryByTestId('Loading')).not.toBeInTheDocument();
    });

    const fourteenMonthReportRows = getAllByTestId(
      'FourteenMonthReportTableRow',
    );
    expect(fourteenMonthReportRows).toHaveLength(2);
    expect(fourteenMonthReportRows[0]).toHaveTextContent('test name');
    expect(fourteenMonthReportRows[1]).toHaveTextContent('test name');
    expect(queryByTestId('FourteenMonthReport')).toBeInTheDocument();
  });

  it('should show late indicators when contacts are late', async () => {
    const { getAllByTestId, queryByTestId } = render(<Components />);

    await waitFor(() => {
      expect(queryByTestId('Loading')).not.toBeInTheDocument();
    });

    const fourteenMonthReportRows = getAllByTestId(
      'FourteenMonthReportTableRow',
    );
    expect(
      within(fourteenMonthReportRows[0]).getByTestId('lateCircle60'),
    ).toBeInTheDocument();
  });

  it('can make contact click event happen and pledge amount is correct', async () => {
    const { queryByTestId, getAllByTestId } = render(<Components />);

    await waitFor(() => {
      expect(queryByTestId('Loading')).not.toBeInTheDocument();
    });

    const links = getAllByTestId('totalGivenByContact');
    expect(links[1]).toHaveTextContent('150');

    await waitFor(() => {
      expect(getAllByTestId('pledgeAmount')[1]).toHaveTextContent('100 CAD');
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
    expect(contactTotal[0]).toHaveTextContent('100');
    expect(contactTotal[1]).toHaveTextContent('100');
    expect(contactTotal[2]).toHaveTextContent('100');
    expect(contactTotal[3]).toHaveTextContent('100');

    expect(getByTestId('averageTotal')).toHaveTextContent('50');
    expect(getByTestId('minimumTotal')).toHaveTextContent('100');
    expect(getAllByTestId('overallTotal')[0]).toHaveTextContent('300');
  });
});
