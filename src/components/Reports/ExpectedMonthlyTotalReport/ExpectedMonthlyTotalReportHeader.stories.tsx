import React, { ReactElement } from 'react';
import { Box } from '@material-ui/core';
import { ExpectedMonthlyTotalReportHeader } from './ExpectedMonthlyTotalReportHeader';
import { ExpectedMonthlyTotalReportTable } from './ExpectedMonthlyTotalReportTable';
import { ExpectedMonthlyTotalReportEmpty } from './ExpectedMonthlyTotalReportEmpty';

export default {
  title: 'Reports/ExpectedMonthlyTotal',
};

export const Default = (): ReactElement => {
  return (
    <Box>
      <ExpectedMonthlyTotalReportHeader accountListId="abc" />
      <ExpectedMonthlyTotalReportTable
        accountListId="abc"
        partnerType="Likely Partners"
      />
      <ExpectedMonthlyTotalReportEmpty accountListId="abc" />
    </Box>
  );
};
