import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@material-ui/core';
import theme from '../../../../theme';
import { ExpectedMonthlyTotalReportTable } from './ExpectedMonthlyTotalReportTable';

it('renders', () => {
  const { getByText } = render(
    <ThemeProvider theme={theme}>
      <ExpectedMonthlyTotalReportTable
        title={'Donations So Far This Month'}
        data={[]}
        donations={true}
      />
    </ThemeProvider>,
  );

  expect(getByText('Partner')).toBeInTheDocument();
});
