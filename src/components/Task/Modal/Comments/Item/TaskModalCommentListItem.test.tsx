import { InMemoryCache } from '@apollo/client';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateTime } from 'luxon';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider, gqlMock } from '__tests__/util/graphqlMocking';
import {
  TaskRowFragment,
  TaskRowFragmentDoc,
} from 'src/components/Task/TaskRow/TaskRow.generated';
import {
  GetCommentsForTaskModalCommentListDocument,
  GetCommentsForTaskModalCommentListQuery,
  GetCommentsForTaskModalCommentListQueryVariables,
  TaskModalCommentFragment,
  TaskModalCommentFragmentDoc,
} from '../TaskListComments.generated';
import { DeleteCommentMutation } from './DeleteTaskComment.generated';
import TaskModalCommentsListItem from './TaskModalCommentListItem';

const accountListId = 'account-list-1';
const taskId = 'task-1';
const commentId = 'comment-1';
const router = {
  query: { accountListId },
  isReady: true,
};
const mutationSpy = jest.fn();

interface TestComponentProps {
  cache?: InMemoryCache;
}

const TestComponent: React.FC<TestComponentProps> = ({ cache }) => {
  const comment = gqlMock<TaskModalCommentFragment>(
    TaskModalCommentFragmentDoc,
    {
      mocks: {
        id: commentId,
        updatedAt: DateTime.local(2020, 1, 2).toISODate() ?? '',
        body: 'Notes',
        person: {
          firstName: 'John',
          lastName: 'Doe',
        },
      },
    },
  );

  return (
    <TestRouter router={router}>
      <GqlMockedProvider<{ DeleteComment: DeleteCommentMutation }>
        mocks={{
          DeleteComment: {
            deleteComment: {
              id: 'comment-1',
            },
          },
        }}
        cache={cache}
        onCall={mutationSpy}
      >
        <TaskModalCommentsListItem taskId={taskId} comment={comment} />
      </GqlMockedProvider>
    </TestRouter>
  );
};

describe('TaskModalCommentListItem', () => {
  it('should render', async () => {
    const { findByText, getByText } = render(<TestComponent />);

    expect(await findByText('Notes')).toBeInTheDocument();
    expect(getByText('John Doe')).toBeInTheDocument();
    expect(getByText('Jan 2, 2020')).toBeInTheDocument();
  });

  it('should update', async () => {
    const { findByText, getByRole } = render(<TestComponent />);

    expect(await findByText('Notes')).toBeInTheDocument();
    userEvent.click(getByRole('button', { name: 'Edit' }));
    userEvent.type(getByRole('textbox', { name: 'Body' }), '2');
    userEvent.click(getByRole('button', { name: 'Save' }));

    expect(await findByText('Notes2')).toBeInTheDocument();
    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdateComment', {
        taskId,
        commentId,
        body: 'Notes2',
      }),
    );
  });

  it('should update when enter is pressed', async () => {
    const { findByText, getByRole } = render(<TestComponent />);

    expect(await findByText('Notes')).toBeInTheDocument();
    userEvent.click(getByRole('button', { name: 'Edit' }));
    userEvent.type(getByRole('textbox', { name: 'Body' }), '2{enter}');

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdateComment', {
        taskId,
        commentId,
        body: 'Notes2',
      }),
    );
  });

  it('should cancel update', async () => {
    const { findByText, getByRole } = render(<TestComponent />);

    expect(await findByText('Notes')).toBeInTheDocument();
    userEvent.click(getByRole('button', { name: 'Edit' }));
    userEvent.type(getByRole('textbox', { name: 'Body' }), '2');
    userEvent.click(getByRole('button', { name: 'Cancel' }));

    expect(await findByText('Notes')).toBeInTheDocument();
    await waitFor(() =>
      expect(mutationSpy).not.toHaveGraphqlOperation('UpdateComment'),
    );
  });

  it('should delete', async () => {
    // Prime the cache with the comment list and count
    const cache = new InMemoryCache();
    const taskFragmentQuery = {
      id: `Task:${taskId}`,
      fragment: TaskRowFragmentDoc,
    };
    cache.writeFragment<TaskRowFragment>({
      ...taskFragmentQuery,
      data: gqlMock<TaskRowFragment>(taskFragmentQuery.fragment, {
        mocks: {
          id: taskId,
          comments: {
            totalCount: 3,
          },
        },
      }),
    });

    const commentsListQuery = {
      query: GetCommentsForTaskModalCommentListDocument,
      variables: {
        accountListId,
        taskId,
      },
    };
    cache.writeQuery<
      GetCommentsForTaskModalCommentListQuery,
      GetCommentsForTaskModalCommentListQueryVariables
    >({
      ...commentsListQuery,
      data: gqlMock<
        GetCommentsForTaskModalCommentListQuery,
        GetCommentsForTaskModalCommentListQueryVariables
      >(commentsListQuery.query, {
        mocks: {
          task: {
            comments: {
              nodes: [
                { id: 'comment-1' },
                { id: 'comment-2' },
                { id: 'comment-3' },
              ],
            },
          },
        },
        variables: commentsListQuery.variables,
      }),
    });

    const { findByRole } = render(<TestComponent cache={cache} />);

    userEvent.click(await findByRole('button', { name: 'Delete' }));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('DeleteComment', {
        taskId,
        commentId,
      }),
    );

    await waitFor(() =>
      expect(
        cache.readFragment<TaskRowFragment>(taskFragmentQuery)?.comments
          .totalCount,
      ).toBe(2),
    );

    await waitFor(() =>
      expect(
        cache.readQuery<GetCommentsForTaskModalCommentListQuery>(
          commentsListQuery,
        )?.task.comments.nodes.length,
      ).toBe(2),
    );
  });
});
