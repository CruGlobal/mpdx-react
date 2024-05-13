import React, { ReactElement } from 'react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { ContactsWrapper } from 'pages/accountLists/[accountListId]/contacts/ContactsWrapper';
import { ContactsLeftPanel } from './ContactsLeftPanel';

export default {
  title: 'Contacts/LeftPanel',
};

export const Default = (): ReactElement => {
  return (
    <GqlMockedProvider>
      <ContactsWrapper>
        <ContactsLeftPanel />
      </ContactsWrapper>
    </GqlMockedProvider>
  );
};
