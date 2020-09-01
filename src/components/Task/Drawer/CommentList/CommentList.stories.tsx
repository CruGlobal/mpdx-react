import React, { ReactElement } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import {
    GetCommentsForTaskDrawerCommentListMocks,
    GetCommentsForTaskDrawerCommentListEmptyMocks,
} from './CommentList.mock';
import TaskDrawerContactList from '.';

export default {
    title: 'Task/Drawer/CommentList',
};

export const Default = (): ReactElement => {
    return (
        <MockedProvider mocks={GetCommentsForTaskDrawerCommentListMocks()} addTypename={false}>
            <TaskDrawerContactList accountListId="abc" taskId="task-1" />
        </MockedProvider>
    );
};

export const Loading = (): ReactElement => {
    return (
        <MockedProvider mocks={[]} addTypename={false}>
            <TaskDrawerContactList accountListId="abc" taskId="task-1" />
        </MockedProvider>
    );
};

export const Empty = (): ReactElement => {
    return (
        <MockedProvider mocks={GetCommentsForTaskDrawerCommentListEmptyMocks()} addTypename={false}>
            <TaskDrawerContactList accountListId="abc" taskId="task-1" />
        </MockedProvider>
    );
};
