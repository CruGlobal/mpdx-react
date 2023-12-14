import React, { ReactElement } from 'react';
import { GqlMockedProvider } from '../../../__tests__/util/graphqlMocking';
import { ContactsPage } from '../../../pages/accountLists/[accountListId]/contacts/ContactsPage';
import { ContactsContainer } from './ContactsContainer';

export default {
  title: 'Contacts/Container',
};

export const Default = (): ReactElement => {
  return (
    <GqlMockedProvider>
      <ContactsPage>
        <ContactsContainer />
      </ContactsPage>
    </GqlMockedProvider>
  );
};
