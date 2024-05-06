import React, { ReactElement } from 'react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { ContactsWrapper } from 'pages/accountLists/[accountListId]/contacts/ContactsWrapper';
import { ContactsList } from './ContactsList';

export default {
  title: 'Contacts/List',
};

export const Default = (): ReactElement => {
  return (
    <GqlMockedProvider>
      <ContactsWrapper>
        <ContactsList />
      </ContactsWrapper>
    </GqlMockedProvider>
  );
};
