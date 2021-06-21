import React, { ReactElement } from 'react';

import { ExpectedMonthlyTotalReport } from './ExpectedMonthlyTotalReport';

export default {
  title: 'Reports/ExpectedMonthlyTotal',
};

function createData(
  name: string,
  contactId: string,
  status: string,
  commitment: string,
  frequency: string,
  converted: string,
  currency: string,
  donation: string,
) {
  return {
    name,
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
  return <ExpectedMonthlyTotalReport accountListId={'abc'} data={rows} />;
};

export const Empty = (): ReactElement => {
  return <ExpectedMonthlyTotalReport accountListId={'abc'} data={[]} />;
};
