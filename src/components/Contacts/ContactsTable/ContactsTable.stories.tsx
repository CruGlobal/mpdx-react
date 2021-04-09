import React, { ReactElement } from 'react';
import { ContactsQuery } from '../../../../pages/accountLists/[accountListId]/Contacts.generated';
import { GqlMockedProvider } from '../../../../__tests__/util/graphqlMocking';
import { ContactsTable } from './ContactsTable';

export default {
  title: 'Contacts/ContactsTable',
};

const accountListId = '111';
const onContactSelected = () => {};

export const Default = (): ReactElement => {
  return (
    <GqlMockedProvider<ContactsQuery>>
      <ContactsTable
        accountListId={accountListId}
        onContactSelected={onContactSelected}
      />
    </GqlMockedProvider>
  );
};

export const Loading = (): ReactElement => {
  const mocks = {
    Contacts: {
      contacts: {
        nodes: [],
      },
    },
  };

  return (
    <GqlMockedProvider<ContactsQuery> mocks={mocks}>
      <ContactsTable
        accountListId={accountListId}
        onContactSelected={onContactSelected}
      />
    </GqlMockedProvider>
  );
};

export const Empty = (): ReactElement => {
  const mocks = {
    Contacts: {
      contacts: {
        nodes: [],
      },
    },
  };

  return (
    <GqlMockedProvider<ContactsQuery> mocks={mocks}>
      <ContactsTable
        accountListId={accountListId}
        onContactSelected={onContactSelected}
      />
    </GqlMockedProvider>
  );
};

export const Error = (): ReactElement => {
  const mocks = {
    Contacts: {
      contacts: {
        nodes: [],
      },
    },
    error: { name: 'error', message: 'Error loading data. Try again.' },
  };

  return (
    <GqlMockedProvider<ContactsQuery> mocks={mocks}>
      <ContactsTable
        accountListId={accountListId}
        onContactSelected={onContactSelected}
      />
    </GqlMockedProvider>
  );
};
