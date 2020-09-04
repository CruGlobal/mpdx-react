import React, { ReactElement } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import cacheMock from '../../../../tests/cacheMock';
import { getDataForTaskDrawerMock, updateTaskMutationMock, createTaskMutationMock } from './Form/Form.mock';
import { getContactsForTaskDrawerContactListMock } from './ContactList/ContactList.mock';
import { getCommentsForTaskDrawerCommentListMock } from './CommentList/CommentList.mock';
import { getTaskForTaskDrawerMock } from './Drawer.mock';
import TaskDrawer from '.';

export default {
    title: 'Task/Drawer',
};

export const Default = (): ReactElement => (
    <MockedProvider
        mocks={[getDataForTaskDrawerMock(), createTaskMutationMock()]}
        cache={cacheMock({ currentAccountListId: 'abc' })}
        addTypename={false}
    >
        <TaskDrawer />
    </MockedProvider>
);

export const Persisted = (): ReactElement => {
    const mocks = [
        getDataForTaskDrawerMock(),
        getContactsForTaskDrawerContactListMock(),
        getCommentsForTaskDrawerCommentListMock(),
        updateTaskMutationMock(),
        getTaskForTaskDrawerMock(),
    ];

    return (
        <MockedProvider mocks={mocks} cache={cacheMock({ currentAccountListId: 'abc' })} addTypename={false}>
            <TaskDrawer taskId="task-1" />
        </MockedProvider>
    );
};
