import { MockedProvider } from '@apollo/client/testing';
import { Box } from '@material-ui/core';
import { number, withKnobs } from '@storybook/addon-knobs';
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
  decorators: [withKnobs],
};

const accountListId = '111';

const StorybookContactFilters = (): ReactElement => (
  <Box width={number('Width', 290)} height="100vh" bgcolor="#fff">
    <ContactFilters
      accountListId={accountListId}
      width={number('Width', 290)}
      onClose={() => {}}
      onSelectedFiltersChanged={() => {}}
    />
  </Box>
);

export const Default = (): ReactElement => (
  <GqlMockedProvider<ContactFiltersQuery>
    mocks={{ ContactFilters: ContactFiltersDefaultMock }}
  >
    <StorybookContactFilters />
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
      <StorybookContactFilters />
    </MockedProvider>
  );
};

export const Empty = (): ReactElement => (
  <GqlMockedProvider<ContactFiltersQuery>
    mocks={{ ContactFilters: ContactFiltersEmptyMock }}
  >
    <StorybookContactFilters />
  </GqlMockedProvider>
);

export const Error = (): ReactElement => (
  <GqlMockedProvider<ContactFiltersQuery>
    mocks={{ ContactFilters: ContactFiltersErrorMock }}
  >
    <StorybookContactFilters />
  </GqlMockedProvider>
);
