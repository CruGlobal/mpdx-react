import React, { ReactElement } from 'react';
import { Box, MuiThemeProvider } from '@mui/material';
import theme from '../../../../../theme';
import { GqlMockedProvider } from '../../../../../../__tests__/util/graphqlMocking';
import { ContactTags } from './ContactTags';
import { UpdateContactTagsMutation } from './ContactTags.generated';

export default {
  title: 'Contacts/Tab/ContactDetailsTab/ContactTags',
  component: ContactTags,
};

const accountListId = '123';
const contactId = 'abc';
export const Default = ({
  contactTags,
}: {
  contactTags: string[];
}): ReactElement => {
  return (
    <Box m={2}>
      <GqlMockedProvider<UpdateContactTagsMutation>>
        <MuiThemeProvider theme={theme}>
          <ContactTags
            accountListId={accountListId}
            contactId={contactId}
            contactTags={contactTags}
          />
        </MuiThemeProvider>
      </GqlMockedProvider>
    </Box>
  );
};
Default.args = {
  contactTags: ['help', 'something'],
};

export const EmptyTags = ({
  contactTags,
}: {
  contactTags: string[];
}): ReactElement => {
  return (
    <Box m={2}>
      <GqlMockedProvider<UpdateContactTagsMutation>>
        <MuiThemeProvider theme={theme}>
          <ContactTags
            accountListId={accountListId}
            contactId={contactId}
            contactTags={contactTags}
          />
        </MuiThemeProvider>
      </GqlMockedProvider>
    </Box>
  );
};
EmptyTags.args = {
  contactTags: [],
};
