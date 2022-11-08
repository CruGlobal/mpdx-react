import React, { ReactElement } from 'react';
import { Box } from '@mui/material';
import Balance from '.';

export default {
  title: 'Dashboard/Balance',
};

export const Default = (): ReactElement => {
  return (
    <Box m={2}>
      <Balance balance={500} currencyCode="GBP" />
    </Box>
  );
};
export const Empty = (): ReactElement => {
  return (
    <Box m={2}>
      <Balance />
    </Box>
  );
};
export const Loading = (): ReactElement => {
  return (
    <Box m={2}>
      <Balance loading />
    </Box>
  );
};
