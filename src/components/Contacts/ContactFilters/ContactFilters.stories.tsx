import { MockedProvider } from '@apollo/client/testing';
import React, { ReactElement } from 'react';
import { ContactFilters } from './ContactFilters';
import {
  ContactFiltersQueryDefaultMocks,
  ContactFiltersQueryEmptyMocks,
  ContactFiltersQueryLoadingMocks,
} from './ContactFilters.mock';

export default {
  title: 'ContactFilters',
};

const accountListId = '111';

export const Default = (): ReactElement => {
  return (
    <MockedProvider mocks={ContactFiltersQueryDefaultMocks(accountListId)}>
      <ContactFilters accountListId={accountListId} />
    </MockedProvider>
  );
};

export const Loading = (): ReactElement => {
  return (
    <MockedProvider mocks={ContactFiltersQueryLoadingMocks(accountListId)}>
      <ContactFilters accountListId={accountListId} />
    </MockedProvider>
  );
};

export const Empty = (): ReactElement => {
  return (
    <MockedProvider mocks={ContactFiltersQueryEmptyMocks(accountListId)}>
      <ContactFilters accountListId={accountListId} />
    </MockedProvider>
  );
};

Default.story = {
  parameters: {
    chromatic: { delay: 1000 },
  },
};
