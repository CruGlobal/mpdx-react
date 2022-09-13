import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import userEvent from '@testing-library/user-event';
import { FourteenMonthReportTableHead } from './TableHead';
import theme from 'src/theme';

const onRequestSort = jest.fn();

const order = 'asc';
const orderBy = 'total';
const salaryCurrency = 'CAD';
const totals = {
  average: 1831,
  minimum: 1583.63,
  months: [
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
  ],
  year: 24613.04,
};

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
});
