import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@material-ui/core';
import theme from '../../../../theme';
import { DonationsReportTable } from './DonationsReportTable';

it('renders', () => {
  const { getByText } = render(
    <ThemeProvider theme={theme}>
      <DonationsReportTable data={[]} accountListId="abc" />
    </ThemeProvider>,
  );

  expect(getByText('No donations received')).toBeInTheDocument();
});
