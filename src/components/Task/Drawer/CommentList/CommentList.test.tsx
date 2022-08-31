import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material';
import TestWrapper from '../../../../../__tests__/util/TestWrapper';
import theme from '../../../../theme';
import {
  getCommentsForTaskDrawerCommentListMock,
  getCommentsForTaskDrawerCommentListEmptyMock,
  getCommentsForTaskDrawerCommentListLoadingMock,
} from './CommentList.mock';
import { createTaskCommentMutationMock } from './Form/Form.mock';
import TaskDrawerCommentList from '.';

const accountListId = 'abc';
const taskId = 'task-1';

jest.mock('uuid', () => ({
  v4: (): string => 'comment-0',
}));

describe('TaskDrawerCommentList', () => {
  it('default', async () => {
    const { queryByTestId, getAllByTestId, getByRole } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper
          mocks={[
            getCommentsForTaskDrawerCommentListMock(accountListId, taskId),
            createTaskCommentMutationMock(),
          ]}
        >
          <TaskDrawerCommentList
            accountListId={accountListId}
            taskId={taskId}
          />
        </TestWrapper>
      </ThemeProvider>,
    );
    await waitFor(() =>
      expect(
        queryByTestId('TaskDrawerCommentListLoading'),
      ).not.toBeInTheDocument(),
    );
    userEvent.type(getByRole('textbox'), 'comment{enter}');
    await waitFor(() => expect(getByRole('textbox')).toHaveValue(''));
    expect(
      getAllByTestId(/TaskDrawerCommentListItem-comment-./).map((element) =>
        element.getAttribute('data-testid'),
      ),
    ).toEqual([
      'TaskDrawerCommentListItem-comment-1',
      'TaskDrawerCommentListItem-comment-2',
      'TaskDrawerCommentListItem-comment-3',
      'TaskDrawerCommentListItem-comment-4',
      'TaskDrawerCommentListItem-comment-5',
      'TaskDrawerCommentListItem-comment-6',
      'TaskDrawerCommentListItem-comment-0',
    ]);
  });

  it('loading', () => {
    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper
          mocks={[
            getCommentsForTaskDrawerCommentListLoadingMock(
              accountListId,
              taskId,
            ),
          ]}
        >
          <TaskDrawerCommentList
            accountListId={accountListId}
            taskId={taskId}
          />
        </TestWrapper>
      </ThemeProvider>,
    );
    expect(getByTestId('TaskDrawerCommentListLoading')).toBeInTheDocument();
  });

  it('empty', async () => {
    const { queryByTestId, getByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper
          mocks={[
            getCommentsForTaskDrawerCommentListEmptyMock(accountListId, taskId),
          ]}
        >
          <TaskDrawerCommentList
            accountListId={accountListId}
            taskId={taskId}
          />
        </TestWrapper>
      </ThemeProvider>,
    );
    await waitFor(() =>
      expect(
        queryByTestId('TaskDrawerCommentListLoading'),
      ).not.toBeInTheDocument(),
    );
    expect(getByTestId('TaskDrawerCommentListEmpty')).toBeInTheDocument();
  });
});
