import React, { ReactElement } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import withDispatch from '../../../decorators/withDispatch';
import {
  getDataForTaskDrawerMock,
  updateTaskMutationMock,
  createTaskMutationMock,
} from './Form/Form.mock';
import { getContactsForTaskDrawerContactListMock } from './ContactList/ContactList.mock';
import { getCommentsForTaskDrawerCommentListMock } from './CommentList/CommentList.mock';
import { getTaskForTaskDrawerMock } from './Drawer.mock';
import { completeTaskMutationMock } from './CompleteForm/CompleteForm.mock';
import TaskDrawer from '.';

export default {
  title: 'Task/Drawer',
  decorators: [
    withDispatch({ type: 'updateAccountListId', accountListId: 'abc' }),
  ],
};

export const Default = (): ReactElement => {
  const mocks = [
    getDataForTaskDrawerMock(),
    { ...createTaskMutationMock(), delay: 500 },
  ];
  return (
    <MockedProvider mocks={mocks} addTypename={false}>
      <TaskDrawer />
    </MockedProvider>
  );
};

export const Persisted = (): ReactElement => {
  const mocks = [
    getDataForTaskDrawerMock(),
    getContactsForTaskDrawerContactListMock(),
    getCommentsForTaskDrawerCommentListMock(),
    { ...updateTaskMutationMock(), delay: 500 },
    getTaskForTaskDrawerMock(),
  ];

  return (
    <MockedProvider mocks={mocks} addTypename={false}>
      <TaskDrawer taskId="task-1" />
    </MockedProvider>
  );
};

export const showCompleteForm = (): ReactElement => {
  const mocks = [
    getDataForTaskDrawerMock(),
    getContactsForTaskDrawerContactListMock(),
    getCommentsForTaskDrawerCommentListMock(),
    { ...completeTaskMutationMock(), delay: 500 },
    getTaskForTaskDrawerMock(),
  ];

  return (
    <MockedProvider mocks={mocks} addTypename={false}>
      <TaskDrawer taskId="task-1" showCompleteForm />
    </MockedProvider>
  );
};
