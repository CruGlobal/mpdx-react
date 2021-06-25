import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@material-ui/core';
import theme from '../../../theme';
import { ExpectedMonthlyTotalReport } from './ExpectedMonthlyTotalReport';

it('renders', () => {
  const { getByText } = render(
    <ThemeProvider theme={theme}>
      <ExpectedMonthlyTotalReport accountListId={'abc'} data={[]} />
    </ThemeProvider>,
  );

  expect(
    getByText('You have no expected donations this month'),
  ).toBeInTheDocument();
});
