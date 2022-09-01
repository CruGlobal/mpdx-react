import { MockedProvider } from '@apollo/client/testing';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import React, { ReactElement } from 'react';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import theme from '../../../../theme';
import { ContactDetailProvider } from '../ContactDetailContext';
import { ContactDetailsTab } from './ContactDetailsTab';
import {
  ContactDetailsTabDocument,
  ContactDetailsTabQuery,
} from './ContactDetailsTab.generated';

export default {
  title: 'Contacts/Tab/ContactDetailsTab',
  component: ContactDetailsTab,
};

const accountListId = '111';
const contactId = '222';

export const Default = (): ReactElement => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GqlMockedProvider<ContactDetailsTabQuery>>
        <ContactDetailProvider>
          <ContactDetailsTab
            accountListId={accountListId}
            contactId={contactId}
            onContactSelected={() => {}}
          />
        </ContactDetailProvider>
      </GqlMockedProvider>
    </ThemeProvider>
  );
};

export const Loading = (): ReactElement => {
  return (
    <MockedProvider
      mocks={[
        {
          request: {
            query: ContactDetailsTabDocument,
            variables: {
              accountListId: accountListId,
              contactId: contactId,
            },
          },
          result: {},
          delay: 8640000,
        },
      ]}
    >
      <ContactDetailProvider>
        <ContactDetailsTab
          accountListId={accountListId}
          contactId={contactId}
          onContactSelected={() => {}}
        />
      </ContactDetailProvider>
    </MockedProvider>
  );
};
