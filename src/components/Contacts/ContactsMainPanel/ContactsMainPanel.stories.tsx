import React, { ReactElement } from 'react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { ContactsWrapper } from 'pages/accountLists/[accountListId]/contacts/ContactsWrapper';
import { ContactsMainPanel } from './ContactsMainPanel';

export default {
  title: 'Contacts/MainPanel',
};

export const Default = (): ReactElement => {
  return (
    <GqlMockedProvider>
      <ContactsWrapper>
        <ContactsMainPanel />
      </ContactsWrapper>
    </GqlMockedProvider>
  );
};
