import React, { ReactElement } from 'react';
import { MockedProvider } from '@apollo/client/testing';
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
        <TaskDrawer accountListId="abc" />
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
            <TaskDrawer accountListId="abc" taskId="task-1" />
        </MockedProvider>
    );
};
