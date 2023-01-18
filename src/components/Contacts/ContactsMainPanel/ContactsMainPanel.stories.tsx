import React, { ReactElement } from 'react';
import { ContactsMainPanel } from './ContactsMainPanel';
import { ContactsQuery } from 'pages/accountLists/[accountListId]/contacts/Contacts.generated';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { ContactsPage } from 'pages/accountLists/[accountListId]/contacts/ContactsPage';

export default {
  title: 'Contacts/MainPanel',
};

export const Default = (): ReactElement => {
  return (
    <GqlMockedProvider<ContactsQuery>>
      <ContactsPage>
        <ContactsMainPanel />
      </ContactsPage>
    </GqlMockedProvider>
  );
};
