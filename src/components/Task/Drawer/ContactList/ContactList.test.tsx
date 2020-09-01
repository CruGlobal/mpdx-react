import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import {
    getContactsForTaskDrawerContactListMock,
    getContactsForTaskDrawerContactListEmptyMock,
    getContactsForTaskDrawerContactListLoadingMock,
} from './ContactList.mock';
import TaskDrawerContactList from '.';

describe(TaskDrawerContactList.name, () => {
    it('default', async () => {
        const { queryByTestId, getAllByTestId } = render(
            <MockedProvider mocks={[getContactsForTaskDrawerContactListMock()]} addTypename={false}>
                <TaskDrawerContactList accountListId="abc" contactIds={['contact-1', 'contact-2']} />
            </MockedProvider>,
        );
        await waitFor(() => expect(queryByTestId('TaskDrawerContactListLoading')).not.toBeInTheDocument());
        expect(
            getAllByTestId(/TaskDrawerContactListItem-contact-./).map((element) => element.getAttribute('data-testid')),
        ).toEqual(['TaskDrawerContactListItem-contact-1', 'TaskDrawerContactListItem-contact-2']);
    });

    it('loading', () => {
        const { getByTestId } = render(
            <MockedProvider mocks={[getContactsForTaskDrawerContactListLoadingMock()]} addTypename={false}>
                <TaskDrawerContactList accountListId="abc" contactIds={['contact-1', 'contact-2']} />
            </MockedProvider>,
        );
        expect(getByTestId('TaskDrawerContactListLoading')).toBeInTheDocument();
    });

    it('empty', async () => {
        const { queryByTestId, getByTestId } = render(
            <MockedProvider mocks={[getContactsForTaskDrawerContactListEmptyMock()]} addTypename={false}>
                <TaskDrawerContactList accountListId="abc" contactIds={['contact-1', 'contact-2']} />
            </MockedProvider>,
        );
        await waitFor(() => expect(queryByTestId('TaskDrawerContactListLoading')).not.toBeInTheDocument());
        expect(getByTestId('TaskDrawerContactListEmpty')).toBeInTheDocument();
    });
});
