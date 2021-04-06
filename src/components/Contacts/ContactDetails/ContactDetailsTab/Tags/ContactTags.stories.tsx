import React, { ReactElement } from 'react';
import { Box, CssBaseline, MuiThemeProvider } from '@material-ui/core';
import { array } from '@storybook/addon-knobs';
import theme from '../../../../../theme';
import { ContactTags } from './ContactTags';

export default {
  title: 'Contacts/Tab/ContactDetailsTab/ContactTags',
  component: ContactTags,
};

export const Default = (): ReactElement => {
  return (
    <Box m={2}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <ContactTags
          contactId="contact_id"
          contactTags={array('contactTags', ['help', 'something'])}
        />
      </MuiThemeProvider>
    </Box>
  );
};

export const EmptyTags = (): ReactElement => {
  return (
    <Box m={2}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <ContactTags
          contactId="contact_id"
          contactTags={array('contactTags', [])}
        />
      </MuiThemeProvider>
    </Box>
  );
};
