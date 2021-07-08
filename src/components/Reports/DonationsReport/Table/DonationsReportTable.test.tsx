import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@material-ui/core';
import theme from '../../../../theme';
import { DonationsReportTable } from './DonationsReportTable';

const data = [
  {
    date: new Date(2018, 0, 0o5, 17, 23, 42, 11),
    partnerId: '00687849-5b74-43dd-86de-e841c6f30fc0',
    partner: 'Bob',
    currency: 'CAD',
    foreignCurrency: 'USD',
    convertedAmount: 123.02,
    foreignAmount: 100,
    designation: 'You',
    method: 'bank_trans',
    id: '1',
  },
];

it('renders', () => {
  const { getByTestId } = render(
    <ThemeProvider theme={theme}>
      <DonationsReportTable data={data} accountListId="abc" />
    </ThemeProvider>,
  );

  expect(getByTestId('donationRow')).toBeInTheDocument();
});
