import React, { ReactElement } from 'react';
import { Box } from '@material-ui/core';
import Loading from '../../Loading';
import { ExpectedMonthlyTotalReportHeader } from './Header/ExpectedMonthlyTotalReportHeader';
import { ExpectedMonthlyTotalReportTable } from './Table/ExpectedMonthlyTotalReportTable';
import { ExpectedMonthlyTotalReportEmpty } from './Empty/ExpectedMonthlyTotalReportEmpty';

export default {
  title: 'Reports/ExpectedMonthlyTotal',
};

export const Default = (): ReactElement => {
  return (
    <Box>
      <ExpectedMonthlyTotalReportHeader accountListId="abc" empty={false} />
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

export const Empty = (): ReactElement => {
  return (
    <Box>
      <ExpectedMonthlyTotalReportHeader accountListId="abc" empty={true} />
      <ExpectedMonthlyTotalReportEmpty accountListId="abc" />
    </Box>
  );
};

export const Table = (): ReactElement => {
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

export const Load = (): ReactElement => {
  return (
    <Box>
      <ExpectedMonthlyTotalReportHeader accountListId={'abc'} empty={true} />
      <Loading loading />
    </Box>
  );
};
