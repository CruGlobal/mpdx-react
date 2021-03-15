import React, { ReactElement } from 'react';
import { Box } from '@material-ui/core';
import { GiftStatus, GiftStatusEnum } from './GiftStatus';

export default {
  title: 'Contacts/ContactRow/Widgets/GiftStatus',
};

export const Default = (): ReactElement => {
  return (
    <Box m={2}>
      <GiftStatus status={GiftStatusEnum.Hidden} />
    </Box>
  );
};
export const LateStatus = (): ReactElement => {
  return (
    <Box m={2}>
      <GiftStatus status={GiftStatusEnum.Late} />
    </Box>
  );
};
export const OnTimeStatus = (): ReactElement => {
  return (
    <Box m={2}>
      <GiftStatus status={GiftStatusEnum.OnTime} />
    </Box>
  );
};
