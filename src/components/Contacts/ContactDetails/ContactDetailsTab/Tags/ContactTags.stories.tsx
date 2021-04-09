import React, { ReactElement } from 'react';
import { Box } from '@material-ui/core';
import { array } from '@storybook/addon-knobs';
import { ContactTags } from './ContactTags';

export default {
  title: 'Contacts/Tab/ContactDetailsTab/ContactTags',
  component: ContactTags,
};

export const Default = (): ReactElement => {
  return (
    <Box m={2}>
      <ContactTags
        accountListId="account_list_id"
        contactId="contact_id"
        contactTags={array('contactTags', ['help', 'something'])}
      />
    </Box>
  );
};

export const EmptyTags = (): ReactElement => {
  return (
    <Box m={2}>
      <ContactTags
        accountListId="account_list_id"
        contactId="contact_id"
        contactTags={array('contactTags', [])}
      />
    </Box>
  );
};
