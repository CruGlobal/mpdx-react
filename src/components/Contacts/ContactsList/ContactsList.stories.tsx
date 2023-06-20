import React, { ReactElement } from 'react';
import { GqlMockedProvider } from '../../../../__tests__/util/graphqlMocking';
import { ContactsList } from './ContactsList';
import { ContactsPage } from 'pages/accountLists/[accountListId]/contacts/ContactsPage';

export default {
  title: 'Contacts/List',
};

export const Default = (): ReactElement => {
  return (
    <GqlMockedProvider>
      <ContactsPage>
        <ContactsList />
      </ContactsPage>
    </GqlMockedProvider>
  );
};
