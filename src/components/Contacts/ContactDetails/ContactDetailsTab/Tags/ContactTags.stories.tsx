import React, { ReactElement } from 'react';
import { Box, MuiThemeProvider } from '@material-ui/core';
import { array } from '@storybook/addon-knobs';
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
export const Default = (): ReactElement => {
  return (
    <Box m={2}>
      <GqlMockedProvider<UpdateContactTagsMutation>>
        <MuiThemeProvider theme={theme}>
          <ContactTags
            accountListId={accountListId}
            contactId={contactId}
            contactTags={array('contactTags', ['help', 'something'])}
          />
        </MuiThemeProvider>
      </GqlMockedProvider>
    </Box>
  );
};

export const EmptyTags = (): ReactElement => {
  return (
    <Box m={2}>
      <GqlMockedProvider<UpdateContactTagsMutation>>
        <MuiThemeProvider theme={theme}>
          <ContactTags
            accountListId={accountListId}
            contactId={contactId}
            contactTags={array('contactTags', [])}
          />
        </MuiThemeProvider>
      </GqlMockedProvider>
    </Box>
  );
};
