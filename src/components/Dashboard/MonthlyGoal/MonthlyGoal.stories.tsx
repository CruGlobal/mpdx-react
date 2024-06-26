import React, { ReactElement } from 'react';
import { Box } from '@mui/material';
import MonthlyGoal from './MonthlyGoal';

export default {
  title: 'Dashboard/MonthlyGoal',
};

export const Default = (): ReactElement => {
  return (
    <Box m={2}>
      <MonthlyGoal
        accountListId="1111"
        goal={1000}
        received={200}
        pledged={500}
        currencyCode="GBP"
      />
    </Box>
  );
};

export const WhenMin = (): ReactElement => {
  return (
    <Box m={2}>
      <MonthlyGoal
        accountListId="1111"
        goal={1000}
        received={0}
        pledged={0}
        currencyCode="AUD"
      />
    </Box>
  );
};
export const WhenMax = (): ReactElement => {
  return (
    <Box m={2}>
      <MonthlyGoal
        accountListId="1111"
        goal={1000}
        received={500}
        pledged={1500}
        currencyCode="NZD"
      />
    </Box>
  );
};
export const Loading = (): ReactElement => {
  return (
    <Box m={2}>
      <MonthlyGoal accountListId="1111" loading />
    </Box>
  );
};
export const Empty = (): ReactElement => {
  return (
    <Box m={2}>
      <MonthlyGoal accountListId="1111" />
    </Box>
  );
};
