import React, { ReactElement } from 'react';
import { ExpectedMonthlyTotalReportTable } from './ExpectedMonthlyTotalReportTable';

export default {
  title: 'Reports/ExpectedMonthlyTotal/Table',
};

export const DonationsTable = (): ReactElement => {
  return (
    <ExpectedMonthlyTotalReportTable
      title={'Donations So Far This Month'}
      data={[]}
      donations={true}
    />
  );
};

export const NotDonations = (): ReactElement => {
  return (
    <ExpectedMonthlyTotalReportTable
      title={'Likely Partners This Month'}
      data={[]}
      donations={false}
    />
  );
};
