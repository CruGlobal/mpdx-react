import { Box, CssBaseline, MuiThemeProvider } from '@material-ui/core';
import React, { ReactElement } from 'react';
import { gqlMock } from '../../../../../../__tests__/util/graphqlMocking';
import theme from '../../../../../theme';
import {
  ContactDetailsTabDocument,
  ContactDetailsTabQuery,
} from '../ContactDetailsTab.generated';
import { ContactDetailsOther } from './ContactDetailsOther';

export default {
  title: 'Contacts/Tab/ContactDetailsTab/Other',
  component: ContactDetailsOther,
};

const accountListId = '111';
const contactId = '222';

export const Default = (): ReactElement => {
  const mock = gqlMock<ContactDetailsTabQuery>(ContactDetailsTabDocument, {
    variables: {
      accountListId: accountListId,
      contactId: contactId,
    },
  });
  return (
    <Box m={2}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <ContactDetailsOther contact={mock} />
      </MuiThemeProvider>
    </Box>
  );
};
