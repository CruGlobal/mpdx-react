import React, { ReactElement } from 'react';
import { Box } from '@material-ui/core';
import { DateTime } from 'luxon';
import { GiftStatus } from './GiftStatus';

export default {
  title: 'Contacts/ContactRow/Widgets/GiftStatus',
};

export const Default = (): ReactElement => {
  return (
    <Box m={2}>
      <GiftStatus lateAt={undefined} />
    </Box>
  );
};
export const LateStatus = (): ReactElement => {
  return (
    <Box m={2}>
      <GiftStatus lateAt={DateTime.now().minus({ day: 1 }).toISO()} />
    </Box>
  );
};
export const OnTimeStatus = (): ReactElement => {
  return (
    <Box m={2}>
      <GiftStatus lateAt={DateTime.now().toISO()} />
    </Box>
  );
};
