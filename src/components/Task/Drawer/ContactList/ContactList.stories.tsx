import React, { ReactElement } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import {
  getContactsForTaskDrawerContactListEmptyMock,
  getContactsForTaskDrawerContactListErrorMock,
  getContactsForTaskDrawerContactListLoadingMock,
  getContactsForTaskDrawerContactListMock,
} from './ContactList.mock';
import TaskDrawerContactList from '.';

const accountListId = 'abc';
const contactIds = ['contact-1', 'contact-2'];

export default {
  title: 'Task/Drawer/ContactList',
};

export const Default = (): ReactElement => {
  return (
    <MockedProvider
      mocks={[
        getContactsForTaskDrawerContactListMock(accountListId, contactIds),
      ]}
      addTypename={false}
    >
      <TaskDrawerContactList
        accountListId={accountListId}
        contactIds={contactIds}
      />
    </MockedProvider>
  );
};

export const Loading = (): ReactElement => {
  return (
    <MockedProvider
      mocks={[
        getContactsForTaskDrawerContactListLoadingMock(
          accountListId,
          contactIds,
        ),
      ]}
      addTypename={false}
    >
      <TaskDrawerContactList
        accountListId={accountListId}
        contactIds={contactIds}
      />
    </MockedProvider>
  );
};

export const Empty = (): ReactElement => {
  return (
    <MockedProvider
      mocks={[
        getContactsForTaskDrawerContactListEmptyMock(accountListId, contactIds),
      ]}
      addTypename={false}
    >
      <TaskDrawerContactList
        accountListId={accountListId}
        contactIds={contactIds}
      />
    </MockedProvider>
  );
};

export const Error = (): ReactElement => {
  return (
    <MockedProvider
      mocks={[
        getContactsForTaskDrawerContactListErrorMock(accountListId, contactIds),
      ]}
      addTypename={false}
    >
      <TaskDrawerContactList
        accountListId={accountListId}
        contactIds={contactIds}
      />
    </MockedProvider>
  );
};
