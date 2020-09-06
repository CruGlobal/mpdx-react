import React, { ReactElement } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { AppProvider } from '../../App';
import { getDataForTaskDrawerMock, updateTaskMutationMock, createTaskMutationMock } from './Form/Form.mock';
import { getContactsForTaskDrawerContactListMock } from './ContactList/ContactList.mock';
import { getCommentsForTaskDrawerCommentListMock } from './CommentList/CommentList.mock';
import { getTaskForTaskDrawerMock } from './Drawer.mock';
import TaskDrawer from '.';

export default {
    title: 'Task/Drawer',
};

export const Default = (): ReactElement => (
    <MockedProvider mocks={[getDataForTaskDrawerMock(), createTaskMutationMock()]} addTypename={false}>
        <AppProvider initialState={{ accountListId: 'abc' }}>
            <TaskDrawer />
        </AppProvider>
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
        <MockedProvider mocks={mocks} addTypename={false}>
            <AppProvider initialState={{ accountListId: 'abc' }}>
                <TaskDrawer taskId="task-1" />
            </AppProvider>
        </MockedProvider>
    );
};
