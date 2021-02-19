import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestWrapper from '../../../../__tests__/util/TestWrapper';
import {
  getDataForTaskDrawerMock,
  createTaskMutationMock,
  updateTaskMutationMock,
} from './Form/Form.mock';
import { getCommentsForTaskDrawerCommentListMock } from './CommentList/CommentList.mock';
import { getContactsForTaskDrawerContactListMock } from './ContactList/ContactList.mock';
import { getTaskForTaskDrawerMock } from './Drawer.mock';
import {
  completeTaskMutationMock,
  getCompleteTaskForTaskDrawerMock,
} from './CompleteForm/CompleteForm.mock';
import TaskDrawer from '.';

describe('TaskDrawer', () => {
  it('default', async () => {
    const onClose = jest.fn();
    const mocks = [getDataForTaskDrawerMock(), createTaskMutationMock()];
    const { getByText, getByRole, getByTestId } = render(
      <TestWrapper mocks={mocks}>
        <TaskDrawer onClose={onClose} defaultValues={{ subject: 'abc' }} />
      </TestWrapper>,
    );
    expect(
      getByRole('tab', { name: 'Contacts ({{ contactCount }})' }),
    ).toBeDisabled();
    expect(getByRole('tab', { name: 'Comments' })).toBeDisabled();
    expect(getByTestId('TaskDrawerTitle')).toHaveTextContent('Add Task');
    userEvent.click(getByText('Save'));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('persisted', async () => {
    const onClose = jest.fn();
    const mocks = [
      getDataForTaskDrawerMock(),
      getContactsForTaskDrawerContactListMock(),
      getCommentsForTaskDrawerCommentListMock(),
      updateTaskMutationMock(),
      getTaskForTaskDrawerMock(),
    ];
    const { findByTestId } = render(
      <TestWrapper mocks={mocks}>
        <TaskDrawer onClose={onClose} taskId="task-1" />
      </TestWrapper>,
    );
    expect(await findByTestId('TaskDrawerTitle')).toHaveTextContent(
      'NEWSLETTER_EMAIL',
    );
  });

  it('showCompleteForm', async () => {
    const onClose = jest.fn();
    const mocks = [
      getDataForTaskDrawerMock(),
      getContactsForTaskDrawerContactListMock(),
      getCommentsForTaskDrawerCommentListMock(),
      completeTaskMutationMock(),
      getCompleteTaskForTaskDrawerMock(),
    ];
    const { findByTestId } = render(
      <TestWrapper mocks={mocks}>
        <TaskDrawer onClose={onClose} taskId="task-1" showCompleteForm />
      </TestWrapper>,
    );
    expect(await findByTestId('TaskDrawerTitle')).toHaveTextContent(
      'Complete {{activityType}}',
    );
  });
});
