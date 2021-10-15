import React, { ReactElement } from 'react';
import { Box } from '@material-ui/core';
import { ContactLateStatusEnum } from '../ContactLateStatusLabel/ContactLateStatusLabel';
import { ContactPartnershipStatusIcon } from './ContactPartnershipStatusIcon';

export default {
  title: 'Contacts/ContactRow/Widgets/ContactPartnershipStatusIcon',
};

export const LateStatus = (): ReactElement => {
  return (
    <Box m={2}>
      <ContactPartnershipStatusIcon
        lateStatusEnum={ContactLateStatusEnum.LateLessThirty}
      />
    </Box>
  );
};
export const OnTimeStatus = (): ReactElement => {
  return (
    <Box m={2}>
      <ContactPartnershipStatusIcon
        lateStatusEnum={ContactLateStatusEnum.OnTime}
      />
    </Box>
  );
};
