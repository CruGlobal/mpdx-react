import React, { ReactElement } from 'react';
import { ExpectedMonthlyTotalReportHeader } from './ExpectedMonthlyTotalReportHeader';

export default {
  title: 'Reports/ExpectedMonthlyTotal/Header',
};

export const Default = (): ReactElement => {
  return <ExpectedMonthlyTotalReportHeader empty={false} />;
};

export const NoDonations = (): ReactElement => {
  return <ExpectedMonthlyTotalReportHeader empty={true} />;
};
