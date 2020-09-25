import React, { ReactElement } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import {
    getCommentsForTaskDrawerCommentListMock,
    getCommentsForTaskDrawerCommentListEmptyMock,
} from './CommentList.mock';
import TaskDrawerCommentList from '.';

export default {
    title: 'Task/Drawer/CommentList',
};

export const Default = (): ReactElement => {
    return (
        <MockedProvider mocks={[getCommentsForTaskDrawerCommentListMock()]} addTypename={false}>
            <TaskDrawerCommentList accountListId="abc" taskId="task-1" />
        </MockedProvider>
    );
};

export const Loading = (): ReactElement => {
    return (
        <MockedProvider mocks={[]} addTypename={false}>
            <TaskDrawerCommentList accountListId="abc" taskId="task-1" />
        </MockedProvider>
    );
};

export const Empty = (): ReactElement => {
    return (
        <MockedProvider mocks={[getCommentsForTaskDrawerCommentListEmptyMock()]} addTypename={false}>
            <TaskDrawerCommentList accountListId="abc" taskId="task-1" />
        </MockedProvider>
    );
};
