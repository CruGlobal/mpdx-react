import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import theme from 'src/theme';
import { EmptyReportTable } from './EmptyReportTable';

const title = 'No Expense Transactions Found';

describe('EmptyReportTable Component', () => {
  it('renders empty report message and title', () => {
    const { getByRole, getByText } = render(
      <ThemeProvider theme={theme}>
        <EmptyReportTable title={title} />
      </ThemeProvider>,
    );

    expect(getByRole('heading', { name: title })).toBeInTheDocument();
    expect(
      getByText('No data to display for this time period.'),
    ).toBeInTheDocument();
  });
});
