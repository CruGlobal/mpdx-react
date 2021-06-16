import React, { ReactElement } from 'react';
import { Box } from '@material-ui/core';
import { ExpectedMonthlyTotalReportEmpty } from './ExpectedMonthlyTotalReportEmpty';

export default {
  title: 'Reports/ExpectedMonthlyTotal/Empty',
};

export const Default = (): ReactElement => {
  return (
    <Box>
      <ExpectedMonthlyTotalReportEmpty></ExpectedMonthlyTotalReportEmpty>
    </Box>
  );
};
