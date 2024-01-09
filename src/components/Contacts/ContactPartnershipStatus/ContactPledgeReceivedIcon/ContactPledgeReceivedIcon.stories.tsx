import React, { ReactElement } from 'react';
import { Box } from '@mui/material';
import { ContactPledgeReceivedIcon } from './ContactPledgeReceivedIcon';

export default {
  title: 'Contacts/ContactRow/Widgets/ContactPledgeReceivedIcon',
};

export const CommitmentRecieved = (): ReactElement => {
  return (
    <Box m={2}>
      <ContactPledgeReceivedIcon pledgeReceived={true} />
    </Box>
  );
};
export const CommitmentNotRecieved = (): ReactElement => {
  return (
    <Box m={2}>
      <ContactPledgeReceivedIcon pledgeReceived={false} />
    </Box>
  );
};
