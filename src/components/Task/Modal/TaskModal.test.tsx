import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@material-ui/core';
import TestWrapper from '../../../../__tests__/util/TestWrapper';
import { ActivityTypeEnum } from '../../../../graphql/types.generated';
import theme from '../../../theme';
import {
  getDataForTaskModalMock,
  createTaskMutationMock,
  updateTaskMutationMock,
} from './Form/TaskModalForm.mock';
import TaskModal from './TaskModal';

const accountListId = 'abc';
const taskId = 'task-1';

jest.mock('next/router', () => ({
  useRouter: () => {
    return {
      query: { accountListId },
      isReady: true,
      events: {
        on: (): void => undefined,
        off: (): void => undefined,
        emit: (): void => undefined,
      },
    };
  },
}));

describe('TaskModal', () => {
  it('default', async () => {
    const onClose = jest.fn();
    const mocks = [
      getDataForTaskModalMock(accountListId),
      createTaskMutationMock(),
    ];
    const { getByText, getByRole, getByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper mocks={mocks}>
          <TaskModal onClose={onClose} defaultValues={{ subject: 'abc' }} />
        </TestWrapper>
      </ThemeProvider>,
    );
    expect(
      getByRole('tab', { hidden: true, name: 'Contacts ({{ contactCount }})' }),
    ).toBeDisabled();
    expect(getByRole('tab', { hidden: true, name: 'Comments' })).toBeDisabled();
    expect(getByTestId('TaskDrawerTitle')).toHaveTextContent('Add Task');
    userEvent.click(getByText('Save'));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('persisted', async () => {
    const onClose = jest.fn();
    const mocks = [
      getDataForTaskModalMock(accountListId),
      updateTaskMutationMock(),
    ];
    const { findByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper mocks={mocks}>
          <TaskModal onClose={onClose} taskId={taskId} />
        </TestWrapper>
      </ThemeProvider>,
    );
    expect(await findByTestId('TaskDrawerTitle')).toHaveTextContent(
      ActivityTypeEnum.NewsletterEmail,
    );
  });

  it('showCompleteForm', async () => {
    const onClose = jest.fn();
    const mocks = [getDataForTaskModalMock(accountListId)];
    const { findByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper mocks={mocks}>
          <TaskModal onClose={onClose} taskId={taskId} showCompleteForm />
        </TestWrapper>
      </ThemeProvider>,
    );
    expect(await findByTestId('TaskDrawerTitle')).toHaveTextContent(
      'Complete {{activityType}}',
    );
  });

  it('shows specific tab | Contact', async () => {
    const onClose = jest.fn();
    const mocks = [getDataForTaskModalMock(accountListId)];
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper mocks={mocks}>
          <TaskModal onClose={onClose} taskId={taskId} />
        </TestWrapper>
      </ThemeProvider>,
    );
    await waitFor(() =>
      expect(getByText('Quinn, Anthony')).toBeInTheDocument(),
    );
  });

  it('shows specific tab | Comment', async () => {
    const onClose = jest.fn();
    const mocks = [getDataForTaskModalMock(accountListId)];
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper mocks={mocks}>
          <TaskModal onClose={onClose} taskId={taskId} />
        </TestWrapper>
      </ThemeProvider>,
    );
    await waitFor(() => expect(getByText('Hello')).toBeInTheDocument());
    await waitFor(() =>
      expect(getByText('How are you doing today?')).toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(getByText('Doing well thank you!')).toBeInTheDocument(),
    );
  });

  it('handles tab change', async () => {
    const onClose = jest.fn();
    const mocks = [getDataForTaskModalMock(accountListId)];
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper mocks={mocks}>
          <TaskModal onClose={onClose} taskId={taskId} />
        </TestWrapper>
      </ThemeProvider>,
    );
    await waitFor(() =>
      expect(getByText('Quinn, Anthony')).toBeInTheDocument(),
    );
    userEvent.click(getByText('Comments'));
    await waitFor(() => expect(getByText('Hello')).toBeInTheDocument());
    await waitFor(() =>
      expect(getByText('How are you doing today?')).toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(getByText('Doing well thank you!')).toBeInTheDocument(),
    );
  });
});
