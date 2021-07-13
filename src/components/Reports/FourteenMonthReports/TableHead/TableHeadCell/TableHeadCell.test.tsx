import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@material-ui/core';
import { TableHeadCell } from './TableHeadCell';
import theme from 'src/theme';

const onClick = jest.fn();
const direction = 'desc';
const children = 'Jul';

describe('FourteenMonthReportTableHead', () => {
  it('default', async () => {
    const { queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <TableHeadCell
          isActive={false}
          direction={direction}
          onClick={onClick}
          sortDirection={false}
        >
          {children}
        </TableHeadCell>
      </ThemeProvider>,
    );

    expect(queryByTestId('SalaryReportTableHead')).toBeInTheDocument();
  });
});
