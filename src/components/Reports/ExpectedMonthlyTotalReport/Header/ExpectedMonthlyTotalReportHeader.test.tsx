import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@material-ui/core';
import theme from '../../../../theme';
import { ExpectedMonthlyTotalReportHeader } from './ExpectedMonthlyTotalReportHeader';

it('renders', () => {
  const { getByText } = render(
    <ThemeProvider theme={theme}>
      <ExpectedMonthlyTotalReportHeader empty={false} />
    </ThemeProvider>,
  );

  expect(getByText('Expected Monthly Total')).toBeInTheDocument();
});
