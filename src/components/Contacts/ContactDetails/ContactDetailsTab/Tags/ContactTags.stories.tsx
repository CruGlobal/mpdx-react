import React, { ReactElement } from 'react';
import { Box } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../../../../theme';
import { GqlMockedProvider } from '../../../../../../__tests__/util/graphqlMocking';
import { ContactTags } from './ContactTags';

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
      <GqlMockedProvider>
        <ThemeProvider theme={theme}>
          <ContactTags
            accountListId={accountListId}
            contactId={contactId}
            contactTags={contactTags}
          />
        </ThemeProvider>
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
      <GqlMockedProvider>
        <ThemeProvider theme={theme}>
          <ContactTags
            accountListId={accountListId}
            contactId={contactId}
            contactTags={contactTags}
          />
        </ThemeProvider>
      </GqlMockedProvider>
    </Box>
  );
};
EmptyTags.args = {
  contactTags: [],
};
