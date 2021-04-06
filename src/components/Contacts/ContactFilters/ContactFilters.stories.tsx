import { MockedProvider } from '@apollo/client/testing';
import React, { ReactElement } from 'react';
import { GqlMockedProvider } from '../../../../__tests__/util/graphqlMocking';
import { ContactFilters } from './ContactFilters';
import {
  ContactFiltersDocument,
  ContactFiltersQuery,
} from './ContactFilters.generated';
import {
  ContactFiltersDefaultMock,
  ContactFiltersEmptyMock,
  ContactFiltersErrorMock,
} from './ContactFilters.mocks';

export default {
  title: 'Contacts/ContactFilters',
};

const accountListId = '111';

export const Default = (): ReactElement => (
  <GqlMockedProvider<ContactFiltersQuery>
    mocks={{ ContactFilters: ContactFiltersDefaultMock }}
  >
    <ContactFilters accountListId={accountListId} />
  </GqlMockedProvider>
);

export const Loading = (): ReactElement => {
  const mock = {
    request: {
      query: ContactFiltersDocument,
      variables: { accountListId: accountListId },
    },
    result: {},
    delay: 86_400_000,
  };

  return (
    <MockedProvider mocks={[mock]}>
      <ContactFilters accountListId={accountListId} />
    </MockedProvider>
  );
};

export const Empty = (): ReactElement => (
  <GqlMockedProvider<ContactFiltersQuery>
    mocks={{ ContactFilters: ContactFiltersEmptyMock }}
  >
    <ContactFilters accountListId={accountListId} />
  </GqlMockedProvider>
);

export const Error = (): ReactElement => (
  <GqlMockedProvider<ContactFiltersQuery>
    mocks={{ ContactFilters: ContactFiltersErrorMock }}
  >
    <ContactFilters accountListId={accountListId} />
  </GqlMockedProvider>
);
