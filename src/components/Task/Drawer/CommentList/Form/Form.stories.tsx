import React, { ReactElement } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { AppProvider } from '../../../../App';
import { getCommentsForTaskDrawerCommentListMock } from '../CommentList.mock';
import { createTaskCommentMutationMock } from './Form.mock';
import TaskDrawerCommentListForm from '.';

export default {
  title: 'Task/Drawer/CommentList/Form',
};

export const Default = (): ReactElement => {
  return (
    <MockedProvider
      mocks={[
        createTaskCommentMutationMock(),
        getCommentsForTaskDrawerCommentListMock(),
      ]}
      addTypename={false}
    >
      <AppProvider
        initialState={{
          user: { id: 'user-1', firstName: 'John', lastName: 'Smith' },
        }}
      >
        <TaskDrawerCommentListForm accountListId="abc" taskId="task-1" />
      </AppProvider>
    </MockedProvider>
  );
};
