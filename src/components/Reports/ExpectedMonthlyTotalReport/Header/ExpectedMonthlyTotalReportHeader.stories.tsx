import React, { ReactElement } from 'react';
import { Box } from '@material-ui/core';
import { ExpectedMonthlyTotalReportHeader } from './ExpectedMonthlyTotalReportHeader';

export default {
  title: 'Reports/ExpectedMonthlyTotal/Header',
};

export const Default = (): ReactElement => {
  return (
    <Box>
      <ExpectedMonthlyTotalReportHeader
        accountListId="abc"
        empty={false}
      ></ExpectedMonthlyTotalReportHeader>
    </Box>
  );
};

export const NoDonations = (): ReactElement => {
  return (
    <Box>
      <ExpectedMonthlyTotalReportHeader
        accountListId="abc"
        empty={true}
      ></ExpectedMonthlyTotalReportHeader>
    </Box>
  );
};
