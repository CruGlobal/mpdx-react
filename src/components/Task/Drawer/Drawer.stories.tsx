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

const accountListId = 'abc';
const contactIds = ['contact-1', 'contact-2'];
const taskId = 'task-1';

export default {
  title: 'Task/Drawer',
  decorators: [withDispatch({ type: 'updateAccountListId', accountListId })],
};

export const Default = (): ReactElement => {
  const mocks = [
    getDataForTaskDrawerMock(accountListId),
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
    getDataForTaskDrawerMock(accountListId),
    getContactsForTaskDrawerContactListMock(accountListId, contactIds),
    getCommentsForTaskDrawerCommentListMock(accountListId, taskId),
    { ...updateTaskMutationMock(), delay: 500 },
    getTaskForTaskDrawerMock(),
  ];

  return (
    <MockedProvider mocks={mocks} addTypename={false}>
      <TaskDrawer taskId={taskId} />
    </MockedProvider>
  );
};

export const showCompleteForm = (): ReactElement => {
  const mocks = [
    getDataForTaskDrawerMock(accountListId),
    getContactsForTaskDrawerContactListMock(accountListId, contactIds),
    getCommentsForTaskDrawerCommentListMock(accountListId, taskId),
    { ...completeTaskMutationMock(), delay: 500 },
    getTaskForTaskDrawerMock(),
  ];

  return (
    <MockedProvider mocks={mocks} addTypename={false}>
      <TaskDrawer taskId={taskId} showCompleteForm />
    </MockedProvider>
  );
};
