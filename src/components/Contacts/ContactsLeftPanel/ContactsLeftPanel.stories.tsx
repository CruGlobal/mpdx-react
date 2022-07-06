import React, { ReactElement } from 'react';
import { ContactsLeftPanel } from './ContactsLeftPanel';
import { ContactsQuery } from 'pages/accountLists/[accountListId]/contacts/Contacts.generated';
import { ContactsPageProvider } from 'pages/accountLists/[accountListId]/contacts/ContactsPageContext';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';

export default {
  title: 'Contacts/LeftPanel',
};

export const Default = (): ReactElement => {
  return (
    <GqlMockedProvider<ContactsQuery>>
      <ContactsPageProvider>
        <ContactsLeftPanel />
      </ContactsPageProvider>
    </GqlMockedProvider>
  );
};
