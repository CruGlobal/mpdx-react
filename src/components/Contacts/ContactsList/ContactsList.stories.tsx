import React, { ReactElement } from 'react';
import { ContactsQuery } from '../../../../pages/accountLists/[accountListId]/contacts/Contacts.generated';
import { GqlMockedProvider } from '../../../../__tests__/util/graphqlMocking';
import { ContactsList } from './ContactsList';
import { ContactsPageProvider } from 'pages/accountLists/[accountListId]/contacts/ContactsPageContext';

export default {
  title: 'Contacts/List',
};

const accountListId = 'account-list-1';

export const Default = (): ReactElement => {
  return (
    <GqlMockedProvider<ContactsQuery>>
      <ContactsPageProvider>
        <ContactsList
          accountListId={accountListId}
          toggleSelectionById={function (_contactId: string): void {}}
          setContactFocus={function (): void {}}
          isRowChecked={function (_id: string) {
            return true;
          }}
          starredFilter={{}}
        />
      </ContactsPageProvider>
    </GqlMockedProvider>
  );
};
