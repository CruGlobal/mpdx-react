import React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InMemoryCache } from '@apollo/client';
import { AppProvider } from '../../../../App';
import { GetCommentsForTaskDrawerCommentListDocument } from '../TaskListComments.generated';
import { User } from '../../../../../../graphql/types.generated';
import { createTaskCommentMutationMock } from './Form.mock';
import TaskDrawerCommentListForm from '.';

jest.mock('uuid', () => ({
  v4: (): string => 'comment-0',
}));

describe('TaskDrawerCommentListForm', () => {
  it('has correct defaults', async () => {
    const cache = new InMemoryCache({ addTypename: false });
    const query = {
      query: GetCommentsForTaskDrawerCommentListDocument,
      variables: {
        accountListId: 'abc',
        taskId: 'task-1',
      },
      data: {
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
        <AppProvider
          initialState={{
            user: {
              id: 'user-1',
              firstName: 'John',
              lastName: 'Smith',
            } as User,
          }}
        >
          <TaskDrawerCommentListForm accountListId="abc" taskId="task-1" />
        </AppProvider>
      </MockedProvider>,
    );
    userEvent.type(getByRole('textbox'), 'c{backspace}');
    await waitFor(() => expect(getByRole('button')).toBeDisabled());
    userEvent.type(getByRole('textbox'), 'comment{enter}');
    await waitFor(() => expect(getByRole('textbox')).toHaveValue(''));
  });
});
