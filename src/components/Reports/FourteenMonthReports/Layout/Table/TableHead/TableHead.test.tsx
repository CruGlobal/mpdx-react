import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from 'src/theme';
import { FourteenMonthReportTableHead } from './TableHead';

const onRequestSort = jest.fn();

const order = 'asc';
const orderBy = 'total';
const salaryCurrency = 'CAD';
const totals = [
  {
    month: '2020-06-01',
    total: 1836.3,
  },
  {
    month: '2020-07-01',
    total: 1836.3,
  },
  {
    month: '2020-08-01',
    total: 1836.3,
  },
];

const noTotals = [];

describe('FourteenMonthReportTableHead', () => {
  it('default', async () => {
    const { queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <FourteenMonthReportTableHead
          isExpanded={true}
          totals={totals}
          salaryCurrency={salaryCurrency}
          order={order}
          orderBy={orderBy}
          onRequestSort={onRequestSort}
        />
      </ThemeProvider>,
    );

    expect(queryByTestId('SalaryReportTableHead')).toBeInTheDocument();
  });

  it('sort event', async () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <FourteenMonthReportTableHead
          isExpanded={true}
          totals={totals}
          salaryCurrency={salaryCurrency}
          order={order}
          orderBy={orderBy}
          onRequestSort={onRequestSort}
        />
      </ThemeProvider>,
    );

    userEvent.click(getByText('Total'));
    expect(onRequestSort).toHaveBeenCalled();
  });
  it('Confirm months headers are not showing with no data', async () => {
    const { queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <FourteenMonthReportTableHead
          isExpanded={true}
          totals={noTotals}
          salaryCurrency={salaryCurrency}
          order={order}
          orderBy={orderBy}
          onRequestSort={onRequestSort}
        />
      </ThemeProvider>,
    );

    expect(queryByTestId('tableHeaderCell')).not.toBeInTheDocument();
  });
});
