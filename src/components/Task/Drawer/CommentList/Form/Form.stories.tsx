import React, { ReactElement } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { AppProvider } from '../../../../App';
import { User } from '../../../../../../graphql/types.generated';
import { createTaskCommentMutationMock } from './Form.mock';
import TaskDrawerCommentListForm from '.';

const accountListId = 'abc';
const taskId = 'task-1';
const userId = 'user-id';
const firstName = 'John';
const lastName = 'Smith';

export default {
  title: 'Task/Drawer/CommentList/Form',
};

export const Default = (): ReactElement => {
  return (
    <MockedProvider mocks={[createTaskCommentMutationMock()]}>
      <AppProvider
        initialState={{
          user: { id: userId, firstName, lastName } as User,
        }}
      >
        <TaskDrawerCommentListForm
          accountListId={accountListId}
          taskId={taskId}
        />
      </AppProvider>
    </MockedProvider>
  );
};
