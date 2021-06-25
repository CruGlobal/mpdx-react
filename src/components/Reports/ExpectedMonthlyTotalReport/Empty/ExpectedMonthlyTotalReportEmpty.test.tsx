import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@material-ui/core';
import theme from '../../../../theme';
import { ExpectedMonthlyTotalReportEmpty } from './ExpectedMonthlyTotalReportEmpty';

it('renders', () => {
  const { getByText } = render(
    <ThemeProvider theme={theme}>
      <ExpectedMonthlyTotalReportEmpty />
    </ThemeProvider>,
  );

  expect(
    getByText('You have no expected donations this month'),
  ).toBeInTheDocument();
});
