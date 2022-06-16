import React, { ReactElement } from 'react';
import { ContactsQuery } from '../../../../pages/accountLists/[accountListId]/contacts/Contacts.generated';
import { GqlMockedProvider } from '../../../../__tests__/util/graphqlMocking';
import { ContactsList } from './ContactsList';

export default {
  title: 'Contacts/List',
};

const accountListId = 'account-list-1';

export const Default = (): ReactElement => {
  return (
    <GqlMockedProvider<ContactsQuery>>
      <ContactsList
        accountListId={accountListId}
        contactDetailsOpen={false}
        toggleSelectionById={function (_contactId: string): void {}}
        setContactFocus={function (): void {}}
        isRowChecked={function (_id: string) {
          return true;
        }}
        starredFilter={{}}
      />
    </GqlMockedProvider>
  );
};
