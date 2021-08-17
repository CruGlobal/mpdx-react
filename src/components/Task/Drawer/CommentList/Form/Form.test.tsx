import React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InMemoryCache } from '@apollo/client';
import { DateTime } from 'luxon';
import { GetCommentsForTaskDrawerCommentListDocument } from '../TaskListComments.generated';
import { createTaskCommentMutationMock } from './Form.mock';
import TaskDrawerCommentListForm from '.';

jest.mock('uuid', () => ({
  v4: (): string => 'comment-0',
}));

describe('TaskDrawerCommentListForm', () => {
  it('has correct defaults', async () => {
    const cache = new InMemoryCache({ addTypename: false });
    jest.spyOn(cache, 'writeQuery');
    const query = {
      query: GetCommentsForTaskDrawerCommentListDocument,
      variables: {
        accountListId: 'abc',
        taskId: 'task-1',
      },
      data: {
        user: {
          id: 'user-1',
          firstName: 'John',
          lastName: 'Smith',
        },
        task: {
          id: 'task-1',
          comments: [],
        },
      },
    };
    cache.writeQuery(query);
    const { getByRole } = render(
      <MockedProvider
        mocks={[createTaskCommentMutationMock()]}
        cache={cache}
        addTypename={false}
      >
        <TaskDrawerCommentListForm accountListId="abc" taskId="task-1" />
      </MockedProvider>,
    );
    userEvent.type(getByRole('textbox'), 'c{backspace}');
    await waitFor(() => expect(getByRole('button')).toBeDisabled());
    userEvent.type(getByRole('textbox'), 'comment{enter}');
    await waitFor(() => expect(getByRole('textbox')).toHaveValue(''));
    await waitFor(() =>
      expect(cache.writeQuery).toHaveBeenCalledWith({
        query: GetCommentsForTaskDrawerCommentListDocument,
        variables: {
          accountListId: 'abc',
          taskId: 'task-1',
        },
        data: {
          task: {
            id: 'task-1',
            comments: {
              nodes: [
                {
                  id: 'comment-0',
                  body: 'comment',
                  createdAt: DateTime.local().toISO(),
                  me: true,
                  person: {
                    id: 'user-1',
                    firstName: 'John',
                    lastName: 'Smith',
                  },
                },
              ],
            },
          },
        },
      }),
    );
  });
});
