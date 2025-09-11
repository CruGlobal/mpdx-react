import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { render } from '@testing-library/react';
import theme from 'src/theme';
import { EmptyReportTable } from './EmptyReportTable';

const title = 'No Expense Transactions Found';

describe('PrintTables Component', () => {
  it('renders empty report message and title', () => {
    const { getByRole, getByText } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <ThemeProvider theme={theme}>
          <EmptyReportTable title={title} />
        </ThemeProvider>
      </LocalizationProvider>,
    );

    expect(getByRole('heading', { name: title })).toBeInTheDocument();
    expect(
      getByText('No data to display for this time period.'),
    ).toBeInTheDocument();
  });
});
