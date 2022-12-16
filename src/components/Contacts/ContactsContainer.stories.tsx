import React, { ReactElement } from 'react';
import { ContactsQuery } from '../../../pages/accountLists/[accountListId]/contacts/Contacts.generated';
import { GqlMockedProvider } from '../../../__tests__/util/graphqlMocking';
import { ContactsContainer } from './ContactsContainer';
import { ContactsPage } from '../../../pages/accountLists/[accountListId]/contacts/ContactsPage';

export default {
  title: 'Contacts/Container',
};

export const Default = (): ReactElement => {
  return (
    <GqlMockedProvider<ContactsQuery>>
      <ContactsPage>
        <ContactsContainer />
      </ContactsPage>
    </GqlMockedProvider>
  );
};
