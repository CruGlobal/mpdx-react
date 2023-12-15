import React, { ReactElement } from 'react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { ContactsPage } from 'pages/accountLists/[accountListId]/contacts/ContactsPage';
import { ContactsLeftPanel } from './ContactsLeftPanel';

export default {
  title: 'Contacts/LeftPanel',
};

export const Default = (): ReactElement => {
  return (
    <GqlMockedProvider>
      <ContactsPage>
        <ContactsLeftPanel />
      </ContactsPage>
    </GqlMockedProvider>
  );
};
