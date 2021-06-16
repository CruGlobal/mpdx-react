import React, { ReactElement } from 'react';
import { Box } from '@material-ui/core';
import { ExpectedMonthlyTotalReportTable } from './ExpectedMonthlyTotalReportTable';

export default {
  title: 'Reports/ExpectedMonthlyTotal/Table',
};

export const Default = (): ReactElement => {
  return (
    <Box>
      <ExpectedMonthlyTotalReportTable
        accountListId={'abc'}
        title={'Donations So Far This Month'}
        data={[]}
        donations={true}
      />
      <ExpectedMonthlyTotalReportTable
        accountListId={'abc'}
        title={'Likely Partners This Month'}
        data={[]}
        donations={false}
      />
      <ExpectedMonthlyTotalReportTable
        accountListId={'abc'}
        title={'Possible Partners This Month'}
        data={[]}
        donations={false}
      />
    </Box>
  );
};
