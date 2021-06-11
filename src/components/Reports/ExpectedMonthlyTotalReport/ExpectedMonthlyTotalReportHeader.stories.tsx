import React, { ReactElement } from 'react';
import { ExpectedMonthlyTotalReportHeader } from './ExpectedMonthlyTotalReportHeader';

export default {
  title: 'Reports/ExpectedMonthlyTotal',
};

export const Default = (): ReactElement => {
  return <ExpectedMonthlyTotalReportHeader accountListId="abc" />;
};
