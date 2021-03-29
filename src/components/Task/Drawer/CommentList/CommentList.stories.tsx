import React, { ReactElement } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import {
  getCommentsForTaskDrawerCommentListMock,
  getCommentsForTaskDrawerCommentListEmptyMock,
  getCommentsForTaskDrawerCommentListLoadingMock,
  getCommentsForTaskDrawerCommentListErrorMock,
} from './CommentList.mock';
import TaskDrawerCommentList from '.';

const accountListId = 'abc';
const taskId = 'task-1';

export default {
  title: 'Task/Drawer/CommentList',
};

export const Default = (): ReactElement => {
  return (
    <MockedProvider
      mocks={[getCommentsForTaskDrawerCommentListMock(accountListId, taskId)]}
      addTypename={false}
    >
      <TaskDrawerCommentList accountListId={accountListId} taskId={taskId} />
    </MockedProvider>
  );
};

export const Loading = (): ReactElement => {
  return (
    <MockedProvider
      mocks={[
        getCommentsForTaskDrawerCommentListLoadingMock(accountListId, taskId),
      ]}
      addTypename={false}
    >
      <TaskDrawerCommentList accountListId={accountListId} taskId={taskId} />
    </MockedProvider>
  );
};

export const Empty = (): ReactElement => {
  return (
    <MockedProvider
      mocks={[
        getCommentsForTaskDrawerCommentListEmptyMock(accountListId, taskId),
      ]}
      addTypename={false}
    >
      <TaskDrawerCommentList accountListId={accountListId} taskId={taskId} />
    </MockedProvider>
  );
};

export const Error = (): ReactElement => {
  return (
    <MockedProvider
      mocks={[
        getCommentsForTaskDrawerCommentListErrorMock(accountListId, taskId),
      ]}
      addTypename={false}
    >
      <TaskDrawerCommentList accountListId={accountListId} taskId={taskId} />
    </MockedProvider>
  );
};
