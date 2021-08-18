import React, { ReactElement } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { createTaskCommentMutationMock } from './Form.mock';
import TaskDrawerCommentListForm from '.';

const accountListId = 'abc';
const taskId = 'task-1';

export default {
  title: 'Task/Drawer/CommentList/Form',
};

export const Default = (): ReactElement => {
  return (
    <MockedProvider mocks={[createTaskCommentMutationMock()]}>
      <TaskDrawerCommentListForm
        accountListId={accountListId}
        taskId={taskId}
      />
    </MockedProvider>
  );
};
