import React, { ReactElement } from 'react';
import { ContactsQuery } from '../../../../pages/accountLists/[accountListId]/contacts/Contacts.generated';
import { GqlMockedProvider } from '../../../../__tests__/util/graphqlMocking';
import { InfiniteList } from './InfiniteList';

export default {
  title: 'Contacts/ContactsTable',
};

const accountListId = '111';

export const Default = (): ReactElement => {
  return (
    <GqlMockedProvider<ContactsQuery>>
      <InfiniteList
        accountListId={accountListId}
        onContactSelected={() => {}}
        onSearchTermChange={() => {}}
        activeFilters={{}}
        filterPanelOpen={false}
        toggleFilterPanel={() => {}}
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
      <InfiniteList
        accountListId={accountListId}
        onContactSelected={() => {}}
        onSearchTermChange={() => {}}
        activeFilters={{}}
        filterPanelOpen={false}
        toggleFilterPanel={() => {}}
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
      <InfiniteList
        accountListId={accountListId}
        onContactSelected={() => {}}
        onSearchTermChange={() => {}}
        activeFilters={{}}
        filterPanelOpen={false}
        toggleFilterPanel={() => {}}
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
      <InfiniteList
        accountListId={accountListId}
        onContactSelected={() => {}}
        onSearchTermChange={() => {}}
        activeFilters={{}}
        filterPanelOpen={false}
        toggleFilterPanel={() => {}}
      />
    </GqlMockedProvider>
  );
};
