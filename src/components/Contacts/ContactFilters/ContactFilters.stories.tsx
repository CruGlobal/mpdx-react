import { GraphQLError } from 'graphql';
import React, { ReactElement } from 'react';
import { GqlMockedProvider } from '../../../../__tests__/util/graphqlMocking';
import { ContactFilters } from './ContactFilters';
import { ContactFiltersQuery } from './ContactFilters.generated';

export default {
  title: 'Contacts/ContactFilters',
};

const accountListId = '111';

export const Default = (): ReactElement => {
  return (
    <GqlMockedProvider<ContactFiltersQuery>>
      <ContactFilters accountListId={accountListId} />
    </GqlMockedProvider>
  );
};

export const Loading = (): ReactElement => {
  const mock = {
    ContactFilters: {
      contactFilters: null,
    },
  };

  return (
    <GqlMockedProvider<ContactFiltersQuery> mocks={mock}>
      <ContactFilters accountListId={accountListId} />
    </GqlMockedProvider>
  );
};

export const Empty = (): ReactElement => {
  const mock = {
    ContactFilters: {
      contactFilters: [],
    },
  };

  return (
    <GqlMockedProvider<ContactFiltersQuery> mocks={mock}>
      <ContactFilters accountListId={accountListId} />
    </GqlMockedProvider>
  );
};

export const Error = (): ReactElement => {
  const mock = {
    ContactFilters: {
      contactFilters: new GraphQLError(
        'GraphQL Error #42: Error loading Filters',
      ),
    },
  };

  return (
    <GqlMockedProvider<ContactFiltersQuery> mocks={mock}>
      <ContactFilters accountListId={accountListId} />
    </GqlMockedProvider>
  );
};
