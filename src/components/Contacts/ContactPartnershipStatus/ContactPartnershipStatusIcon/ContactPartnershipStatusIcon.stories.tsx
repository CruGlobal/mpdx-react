import React, { ReactElement } from 'react';
import { Box } from '@material-ui/core';
import { DateTime } from 'luxon';
import { ContactPartnershipStatusIcon } from './ContactPartnershipStatusIcon';

export default {
  title: 'Contacts/ContactRow/Widgets/ContactPartnershipStatusIcon',
};

export const Default = (): ReactElement => {
  return (
    <Box m={2}>
      <ContactPartnershipStatusIcon lateStatusEnum={undefined} />
    </Box>
  );
};
export const LateStatus = (): ReactElement => {
  return (
    <Box m={2}>
      <ContactPartnershipStatusIcon
        lateStatusEnum={DateTime.now().minus({ day: 1 }).toISO()}
      />
    </Box>
  );
};
export const OnTimeStatus = (): ReactElement => {
  return (
    <Box m={2}>
      <ContactPartnershipStatusIcon lateStatusEnum={DateTime.now().toISO()} />
    </Box>
  );
};
