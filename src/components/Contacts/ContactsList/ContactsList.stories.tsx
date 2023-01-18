import React, { ReactElement } from 'react';
import { ContactsQuery } from '../../../../pages/accountLists/[accountListId]/contacts/Contacts.generated';
import { GqlMockedProvider } from '../../../../__tests__/util/graphqlMocking';
import { ContactsList } from './ContactsList';
import { ContactsPage } from 'pages/accountLists/[accountListId]/contacts/ContactsPage';

export default {
  title: 'Contacts/List',
};

export const Default = (): ReactElement => {
  return (
    <GqlMockedProvider<ContactsQuery>>
      <ContactsPage>
        <ContactsList />
      </ContactsPage>
    </GqlMockedProvider>
  );
};
