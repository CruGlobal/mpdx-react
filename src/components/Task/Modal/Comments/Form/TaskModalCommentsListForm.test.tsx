import { InMemoryCache } from '@apollo/client';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GqlMockedProvider, gqlMock } from '__tests__/util/graphqlMocking';
import {
  TaskRowFragment,
  TaskRowFragmentDoc,
} from 'src/components/Task/TaskRow/TaskRow.generated';
import {
  GetCommentsForTaskModalCommentListDocument,
  GetCommentsForTaskModalCommentListQuery,
  GetCommentsForTaskModalCommentListQueryVariables,
} from '../TaskListComments.generated';
import { TaskModalCommentsListForm } from './TaskModalCommentsListForm';

const accountListId = 'account-list-1';
const taskId = 'task-1';
const handleFormClose = jest.fn();
const mutationSpy = jest.fn();

interface TestComponentProps {
  cache?: InMemoryCache;
}

const TestComponent: React.FC<TestComponentProps> = ({ cache }) => (
  <GqlMockedProvider cache={cache} onCall={mutationSpy}>
    <TaskModalCommentsListForm
      accountListId={accountListId}
      taskId={taskId}
      handleFormClose={handleFormClose}
    />
  </GqlMockedProvider>
);

describe('TaskModalCommentsListForm', () => {
  it('creates a new comment and increments the comment count', async () => {
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
              nodes: [{}, {}, {}],
            },
          },
        },
        variables: commentsListQuery.variables,
      }),
    });

    const { getByRole } = render(<TestComponent cache={cache} />);
    userEvent.type(getByRole('textbox', { name: 'Body' }), 'C');
    userEvent.click(getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('CreateTaskComment', {
        accountListId,
        taskId,
        attributes: {
          body: 'C',
        },
      }),
    );

    await waitFor(() =>
      expect(
        cache.readFragment<TaskRowFragment>(taskFragmentQuery)?.comments
          .totalCount,
      ).toBe(4),
    );

    await waitFor(() =>
      expect(
        cache.readQuery<GetCommentsForTaskModalCommentListQuery>({
          query: GetCommentsForTaskModalCommentListDocument,
          variables: {
            accountListId,
            taskId,
          },
        })?.task.comments.nodes.length,
      ).toBe(4),
    );
  });

  it('adds a new line when shift+enter is pressed', async () => {
    const { getByRole } = render(<TestComponent />);
    userEvent.type(
      getByRole('textbox', { name: 'Body' }),
      'C{shift}{enter}{/shift}C',
    );
    userEvent.click(getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('CreateTaskComment', {
        accountListId,
        taskId,
        attributes: {
          body: 'C\nC',
        },
      }),
    );
  });

  it('saves the comment when enter is pressed', async () => {
    const { getByRole } = render(<TestComponent />);
    userEvent.type(getByRole('textbox', { name: 'Body' }), 'C{enter}');

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('CreateTaskComment', {
        accountListId,
        taskId,
        attributes: {
          body: 'C',
        },
      }),
    );
  });
});
