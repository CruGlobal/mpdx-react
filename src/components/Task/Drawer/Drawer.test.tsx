import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestWrapper from '../../../../__tests__/util/TestWrapper';
import { ActivityTypeEnum } from '../../../../graphql/types.generated';
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
import { ThemeProvider } from '@material-ui/core';
import theme from '../../../theme';

const accountListId = 'abc';
const taskId = 'task-1';
const contactIds = ['contact-1', 'contact-2'];

describe('TaskDrawer', () => {
  it('default', async () => {
    const onClose = jest.fn();
    const mocks = [
      getDataForTaskDrawerMock(accountListId),
      createTaskMutationMock(),
    ];
    const { getByText, getByRole, getByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper mocks={mocks}>
          <TaskDrawer onClose={onClose} defaultValues={{ subject: 'abc' }} />
        </TestWrapper>
      </ThemeProvider>,
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
      getDataForTaskDrawerMock(accountListId),
      getContactsForTaskDrawerContactListMock(accountListId, contactIds),
      getCommentsForTaskDrawerCommentListMock(accountListId, taskId),
      updateTaskMutationMock(),
      getTaskForTaskDrawerMock(),
    ];
    const { findByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper mocks={mocks}>
          <TaskDrawer onClose={onClose} taskId={taskId} />
        </TestWrapper>
      </ThemeProvider>,
    );
    expect(await findByTestId('TaskDrawerTitle')).toHaveTextContent(
      ActivityTypeEnum.NewsletterEmail,
    );
  });

  it('showCompleteForm', async () => {
    const onClose = jest.fn();
    const mocks = [
      getDataForTaskDrawerMock(accountListId),
      getContactsForTaskDrawerContactListMock(accountListId, contactIds),
      getCommentsForTaskDrawerCommentListMock(accountListId, taskId),
      completeTaskMutationMock(accountListId, taskId),
      getCompleteTaskForTaskDrawerMock(accountListId, taskId),
    ];
    const { findByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper mocks={mocks}>
          <TaskDrawer onClose={onClose} taskId={taskId} showCompleteForm />
        </TestWrapper>
      </ThemeProvider>,
    );
    expect(await findByTestId('TaskDrawerTitle')).toHaveTextContent(
      'Complete {{activityType}}',
    );
  });
});
