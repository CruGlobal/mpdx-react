import React, { ReactElement } from 'react';
import { Box, CssBaseline, MuiThemeProvider } from '@material-ui/core';
import theme from '../../../../../theme';
import { ContactTags } from './ContactTags';

export default {
  title: 'Contacts/Tab/ContactDetailTab/ContactTags',
};
const mockTags = ['help', 'tag', 'something'];
const emptyTags = [];
export const Default = (): ReactElement => {
  return contactTagView(mockTags);
};

export const EmptyTags = (): ReactElement => {
  return contactTagView(emptyTags);
};

const contactTagView = (tags: string[]) => {
  return (
    <Box m={2}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <ContactTags contactId="contact_id" contactTags={tags} />
      </MuiThemeProvider>
    </Box>
  );
};
