import React, { ReactElement } from 'react';
import { ContactsWrapper } from 'pages/accountLists/[accountListId]/contacts/ContactsWrapper';
import { GqlMockedProvider } from '../../../../__tests__/util/graphqlMocking';
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
