import { Box } from '@material-ui/core';
import React, { ReactElement } from 'react';
import { ContactDetailsTabMailing } from './ContactDetailsTabMailing';

export default {
  title: 'Contacts/Tab/ContactDetails/Mailing',
};

export const Default = (): ReactElement => {
  return (
    <Box m={2}>
      <ContactDetailsTabMailing />
    </Box>
  );
};
