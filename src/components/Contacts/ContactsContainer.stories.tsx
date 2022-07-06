import React, { ReactElement } from 'react';
import { ContactsPageProvider } from '../../../pages/accountLists/[accountListId]/contacts/ContactsPageContext';
import { ContactsQuery } from '../../../pages/accountLists/[accountListId]/contacts/Contacts.generated';
import { GqlMockedProvider } from '../../../__tests__/util/graphqlMocking';
import { ContactsContainer } from './ContactsContainer';

export default {
  title: 'Contacts/Container',
};

export const Default = (): ReactElement => {
  return (
    <GqlMockedProvider<ContactsQuery>>
      <ContactsPageProvider>
        <ContactsContainer />
      </ContactsPageProvider>
    </GqlMockedProvider>
  );
};
