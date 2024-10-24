import { render } from '@testing-library/react';
import { DateTime } from 'luxon';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider, gqlMock } from '__tests__/util/graphqlMocking';
import {
  TaskModalCommentFragment,
  TaskModalCommentFragmentDoc,
} from '../Modal/Comments/TaskListComments.generated';
import { CommentTooltipText } from './CommentTooltipText';

const accountListId = 'account-list-1';
const commentId = 'comment-1';
const router = {
  query: { accountListId },
  isReady: true,
};

const TestComponent: React.FC = () => {
  const comment = gqlMock<TaskModalCommentFragment>(
    TaskModalCommentFragmentDoc,
    {
      mocks: {
        id: commentId,
        body: 'Comment',
        updatedAt: DateTime.local(2020, 1, 2).toISODate() ?? '',
      },
    },
  );

  return (
    <TestRouter router={router}>
      <GqlMockedProvider>
        <CommentTooltipText comments={[comment]} />
      </GqlMockedProvider>
    </TestRouter>
  );
};

describe('CommentTooltipText', () => {
  it('should render', async () => {
    const { findByText, getByText } = render(<TestComponent />);

    expect(await findByText('Comment')).toBeInTheDocument();
    expect(getByText('Jan 2, 2020')).toBeInTheDocument();
  });
});
