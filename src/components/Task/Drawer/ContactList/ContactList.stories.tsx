import React, { ReactElement } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import {
  getContactsForTaskDrawerContactListEmptyMock,
  getContactsForTaskDrawerContactListLoadingMock,
  getContactsForTaskDrawerContactListMock,
} from './ContactList.mock';
import TaskDrawerContactList from '.';

export default {
  title: 'Task/Drawer/ContactList',
};

export const Default = (): ReactElement => {
  return (
    <MockedProvider
      mocks={[getContactsForTaskDrawerContactListMock()]}
      addTypename={false}
    >
      <TaskDrawerContactList
        accountListId="abc"
        contactIds={['contact-1', 'contact-2']}
      />
    </MockedProvider>
  );
};

export const Loading = (): ReactElement => {
  return (
    <MockedProvider
      mocks={[getContactsForTaskDrawerContactListLoadingMock()]}
      addTypename={false}
    >
      <TaskDrawerContactList
        accountListId="abc"
        contactIds={['contact-1', 'contact-2']}
      />
    </MockedProvider>
  );
};

export const Empty = (): ReactElement => {
  return (
    <MockedProvider
      mocks={[getContactsForTaskDrawerContactListEmptyMock()]}
      addTypename={false}
    >
      <TaskDrawerContactList
        accountListId="abc"
        contactIds={['contact-1', 'contact-2']}
      />
    </MockedProvider>
  );
};
