import React, { ReactElement } from 'react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { ContactsPage } from 'pages/accountLists/[accountListId]/contacts/ContactsPage';
import { ContactsMainPanel } from './ContactsMainPanel';

export default {
  title: 'Contacts/MainPanel',
};

export const Default = (): ReactElement => {
  return (
    <GqlMockedProvider>
      <ContactsPage>
        <ContactsMainPanel />
      </ContactsPage>
    </GqlMockedProvider>
  );
};
