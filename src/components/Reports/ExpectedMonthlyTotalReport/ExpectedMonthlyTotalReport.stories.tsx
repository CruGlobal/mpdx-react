import React, { ReactElement } from 'react';
import { Box } from '@material-ui/core';
import { ExpectedMonthlyTotalReport } from './ExpectedMonthlyTotalReport';

export default {
  title: 'Reports/ExpectedMonthlyTotal',
};

function createData(
  contact: string,
  contactId: string,
  status: string,
  commitment: string,
  frequency: string,
  converted: string,
  currency: string,
  donation: string,
) {
  return {
    contact,
    contactId,
    status,
    commitment,
    frequency,
    converted,
    currency,
    donation,
  };
}

const rows = [
  createData(
    'Adriano, Selinda',
    'abc',
    'Partner - Financial',
    '50',
    'Monthly',
    '50',
    'CAD',
    '50',
  ),
  createData(
    'Adriano, Selinda',
    'abc',
    'Partner - Financial',
    '50',
    'Monthly',
    '50',
    'CAD',
    '50',
  ),
  createData(
    'Adriano, Selinda',
    'abc',
    'Partner - Financial',
    '50',
    'Monthly',
    '50',
    'CAD',
    '50',
  ),
  createData(
    'Adriano, Selinda',
    'abc',
    'Partner - Financial',
    '50',
    'Monthly',
    '50',
    'CAD',
    '50',
  ),
  createData(
    'Adriano, Selinda',
    'abc',
    'Partner - Financial',
    '50',
    'Monthly',
    '50',
    'CAD',
    '50',
  ),
  createData(
    'Adriano, Selinda',
    'abc',
    'Partner - Financial',
    '50',
    'Monthly',
    '50',
    'CAD',
    '50',
  ),
];
export const Default = (): ReactElement => {
  return (
    <Box>
      <ExpectedMonthlyTotalReport
        accountListId={'abc'}
        data={rows}
      ></ExpectedMonthlyTotalReport>
    </Box>
  );
};

export const Empty = (): ReactElement => {
  return (
    <Box>
      <ExpectedMonthlyTotalReport
        accountListId={'abc'}
        data={[]}
      ></ExpectedMonthlyTotalReport>
    </Box>
  );
};
