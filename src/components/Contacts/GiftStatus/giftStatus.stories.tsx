import React, { ReactElement } from 'react';
import { Box } from '@material-ui/core';
import { GiftStatus, GiftStatusEnum } from './giftStatus';

export default {
  title: 'Contacts/GiftStatus',
};

export const Default = (): ReactElement => {
  return (
    <Box m={2}>
      <GiftStatus giftStatusEnum={GiftStatusEnum.Hidden} />
    </Box>
  );
};
export const LateStatus = (): ReactElement => {
  return (
    <Box m={2}>
      <GiftStatus giftStatusEnum={GiftStatusEnum.Late} />
    </Box>
  );
};
export const OnTimeStatus = (): ReactElement => {
  return (
    <Box m={2}>
      <GiftStatus giftStatusEnum={GiftStatusEnum.OnTime} />
    </Box>
  );
};
