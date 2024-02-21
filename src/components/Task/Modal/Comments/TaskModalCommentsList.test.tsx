import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { GetCommentsForTaskModalCommentListQuery } from './TaskListComments.generated';
import { TaskModalCommentsList } from './TaskModalCommentsList';

const accountListId = 'account-list-1';
const taskId = 'task-1';
const onClose = jest.fn();
const mutationSpy = jest.fn();
const router = {
  query: { accountListId },
  isReady: true,
};

interface TestComponentProps {
  empty?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({ empty = false }) => (
  <TestRouter router={router}>
    <GqlMockedProvider<{
      GetCommentsForTaskModalCommentList: GetCommentsForTaskModalCommentListQuery;
    }>
      mocks={{
        GetCommentsForTaskModalCommentList: {
          task: {
            id: taskId,
            comments: {
              nodes: empty
                ? []
                : [
                    { body: 'Comment 1' },
                    { body: 'Comment 2' },
                    { body: 'Comment 3' },
                  ],
            },
          },
        },
      }}
      onCall={mutationSpy}
    >
      <TaskModalCommentsList
        accountListId={accountListId}
        taskId={taskId}
        onClose={onClose}
      />
    </GqlMockedProvider>
  </TestRouter>
);

describe('TaskModalCommentsList', () => {
  it('renders comments', async () => {
    const { findByText } = render(<TestComponent />);
    expect(await findByText('Comment 1')).toBeInTheDocument();
  });

  it('renders zero', async () => {
    const { findByText } = render(<TestComponent empty />);
    expect(await findByText('No comments to show')).toBeInTheDocument();
  });

  it('creates a new comment and increments the comment count', async () => {
    const { findByRole, getByRole } = render(<TestComponent />);
    userEvent.click(await findByRole('button', { name: 'Add Comment' }));
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
  });
});
