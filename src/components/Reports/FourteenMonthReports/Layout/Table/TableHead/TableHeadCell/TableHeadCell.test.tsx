import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@mui/material';
import { TableHeadCell } from './TableHeadCell';
import theme from 'src/theme';

const onClick = jest.fn();
const direction = 'desc';
const children = 'Jul';

describe('FourteenMonthReportTableHead', () => {
  it('default', async () => {
    const { getByText } = render(
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

    expect(getByText(children)).toBeInTheDocument();
  });
});
