import { MockedProvider } from '@apollo/client/testing';
import { Box } from '@material-ui/core';
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
  args: { width: 290 },
};

const accountListId = '111';

const StorybookContactFilters = ({
  width,
}: {
  width: number;
}): ReactElement => (
  <Box width={width} height="100vh" bgcolor="#fff">
    <ContactFilters
      accountListId={accountListId}
      width={width}
      onClose={() => {}}
      selectedFilters={{}}
      onSelectedFiltersChanged={() => {}}
    />
  </Box>
);

export const Default = ({ width }: { width: number }): ReactElement => (
  <GqlMockedProvider<ContactFiltersQuery>
    mocks={{ ContactFilters: ContactFiltersDefaultMock }}
  >
    <StorybookContactFilters width={width} />
  </GqlMockedProvider>
);

export const Loading = ({ width }: { width: number }): ReactElement => {
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
      <StorybookContactFilters width={width} />
    </MockedProvider>
  );
};

export const Empty = ({ width }: { width: number }): ReactElement => (
  <GqlMockedProvider<ContactFiltersQuery>
    mocks={{ ContactFilters: ContactFiltersEmptyMock }}
  >
    <StorybookContactFilters width={width} />
  </GqlMockedProvider>
);

export const Error = ({ width }: { width: number }): ReactElement => (
  <GqlMockedProvider<ContactFiltersQuery>
    mocks={{ ContactFilters: ContactFiltersErrorMock }}
  >
    <StorybookContactFilters width={width} />
  </GqlMockedProvider>
);
