import { MockedProvider } from '@apollo/client/testing';
import React, { ReactElement } from 'react';
import { ContactsTable } from './ContactsTable';
import {
  ContactsQueryDefaultMocks,
  ContactsQueryEmptyMocks,
  ContactsQueryLoadingMocks,
} from './ContactsTable.mock';

export default {
  title: 'ContactsTable',
};

const accountListId = '111';

export const Default = (): ReactElement => {
  return (
    <MockedProvider mocks={ContactsQueryDefaultMocks(accountListId)}>
      <ContactsTable accountListId={accountListId} />
    </MockedProvider>
  );
};

export const Empty = (): ReactElement => {
  return (
    <MockedProvider mocks={ContactsQueryEmptyMocks(accountListId)}>
      <ContactsTable accountListId={accountListId} />
    </MockedProvider>
  );
};

export const Loading = (): ReactElement => {
  return (
    <MockedProvider mocks={ContactsQueryLoadingMocks(accountListId)}>
      <ContactsTable accountListId={accountListId} />
    </MockedProvider>
  );
};

Default.story = {
  parameters: {
    chromatic: { delay: 1000 },
  },
};
