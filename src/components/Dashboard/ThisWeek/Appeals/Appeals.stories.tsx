import React, { ReactElement } from 'react';
import { Box } from '@material-ui/core';
import { GetThisWeekQuery } from '../GetThisWeek.generated';
import Appeals from '.';

export default {
  title: 'Dashboard/ThisWeek/Appeals',
};

export const Default = (): ReactElement => {
  const appeal: GetThisWeekQuery['accountList']['primaryAppeal'] = {
    id: 'appeal',
    name: '2020 End of Year Ask With Really long Appeal Name!',
    amount: 1000,
    pledgesAmountTotal: 750,
    pledgesAmountProcessed: 500,
    amountCurrency: 'GBP',
  };
  return (
    <Box m={2}>
      <Appeals loading={false} appeal={appeal} />
    </Box>
  );
};

export const Empty = (): ReactElement => {
  return (
    <Box m={2}>
      <Appeals loading={false} />
    </Box>
  );
};

export const Loading = (): ReactElement => {
  return (
    <Box m={2}>
      <Appeals loading={true} />
    </Box>
  );
};
