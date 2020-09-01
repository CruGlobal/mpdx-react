import React, { ReactElement } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import {
    GetContactsForTaskDrawerContactListEmptyMocks,
    GetContactsForTaskDrawerContactListMocks,
} from './ContactList.mock';
import TaskDrawerContactList from '.';

export default {
    title: 'Task/Drawer/ContactList',
};

export const Default = (): ReactElement => {
    return (
        <MockedProvider mocks={GetContactsForTaskDrawerContactListMocks()} addTypename={false}>
            <TaskDrawerContactList accountListId="abc" contactIds={['def', 'ghi']} />
        </MockedProvider>
    );
};

export const Loading = (): ReactElement => {
    return (
        <MockedProvider mocks={[]} addTypename={false}>
            <TaskDrawerContactList accountListId="abc" contactIds={['def', 'ghi']} />
        </MockedProvider>
    );
};

export const Empty = (): ReactElement => {
    return (
        <MockedProvider mocks={GetContactsForTaskDrawerContactListEmptyMocks()} addTypename={false}>
            <TaskDrawerContactList accountListId="abc" contactIds={['def', 'ghi']} />
        </MockedProvider>
    );
};
