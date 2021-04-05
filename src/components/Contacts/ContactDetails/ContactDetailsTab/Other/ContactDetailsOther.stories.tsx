import { Box } from '@material-ui/core';
import React, { ReactElement } from 'react';
import { ContactDetailsOther } from './ContactDetailsOther';

export default {
  title: 'Contacts/Tab/ContactDetailsTab/Other',
};

export const Default = (): ReactElement => {
  return (
    <Box m={2}>
      <ContactDetailsOther contact={null} />
    </Box>
  );
};
