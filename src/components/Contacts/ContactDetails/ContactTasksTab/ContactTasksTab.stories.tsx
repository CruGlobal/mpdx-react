import { MockedProvider } from '@apollo/client/testing';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import React, { ReactElement } from 'react';

import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import theme from '../../../../theme';

import { ContactTasksTab } from './ContactTasksTab';
import {
  ContactTasksTabDocument,
  ContactTasksTabQuery,
} from './ContactTasksTab.generated';

export default {
  title: 'Contacts/Tab/ContactTasksTab',
  component: ContactTasksTab,
};

const accountListId = 'abc';
const contactId = 'contact-1';

export const Default = (): ReactElement => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GqlMockedProvider<ContactTasksTabQuery>>
        <ContactTasksTab accountListId={accountListId} contactId={contactId} />
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
            query: ContactTasksTabDocument,
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
      <ContactTasksTab accountListId={accountListId} contactId={contactId} />
    </MockedProvider>
  );
};
