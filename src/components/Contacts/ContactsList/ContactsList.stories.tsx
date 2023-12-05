import React, { ReactElement } from 'react';
import { ContactsPage } from 'pages/accountLists/[accountListId]/contacts/ContactsPage';
import { GqlMockedProvider } from '../../../../__tests__/util/graphqlMocking';
import { ContactsList } from './ContactsList';

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
