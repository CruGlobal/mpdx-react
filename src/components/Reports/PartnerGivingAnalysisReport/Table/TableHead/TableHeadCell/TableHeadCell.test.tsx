import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import theme from 'src/theme';
import { TableHeadCell } from './TableHeadCell';

const onClick = jest.fn();
const direction = 'desc';
const children = 'Jul';

describe('PartnerGivingAnalysisReportTableHeadCell', () => {
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
