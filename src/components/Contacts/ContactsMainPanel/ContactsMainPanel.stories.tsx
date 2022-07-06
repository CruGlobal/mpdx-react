import React, { ReactElement } from 'react';
import { ContactsMainPanel } from './ContactsMainPanel';
import { ContactsQuery } from 'pages/accountLists/[accountListId]/contacts/Contacts.generated';
import { ContactsPageProvider } from 'pages/accountLists/[accountListId]/contacts/ContactsPageContext';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';

export default {
  title: 'Contacts/MainPanel',
};

export const Default = (): ReactElement => {
  return (
    <GqlMockedProvider<ContactsQuery>>
      <ContactsPageProvider>
        <ContactsMainPanel />
      </ContactsPageProvider>
    </GqlMockedProvider>
  );
};
