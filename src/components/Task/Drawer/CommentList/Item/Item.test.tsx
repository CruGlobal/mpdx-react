import React from 'react';
import { render } from '@testing-library/react';
import { GetCommentsForTaskDrawerCommentListQuery_task_comments_nodes as Comment } from '../../../../../../types/GetCommentsForTaskDrawerCommentListQuery';
import Item from '.';

describe('Item', () => {
  const comment: Comment = {
    id: 'def',
    body: 'The quick brown fox jumped over the lazy dog.',
    createdAt: '2020-01-31',
    me: false,
    person: {
      id: 'person-a',
      firstName: 'Bob',
      lastName: 'Jones',
    },
  };

  it('has correct defaults', () => {
    const { getByTestId, getByText } = render(<Item comment={comment} />);
    expect(getByTestId('TaskDrawerCommentListItemAvatar')).toBeInTheDocument();
    expect(
      getByText('The quick brown fox jumped over the lazy dog.'),
    ).toBeInTheDocument();
    expect(getByText('B')).toBeInTheDocument();
    expect(getByText('1 day ago')).toBeInTheDocument();
  });

  it('has correct overrides', () => {
    const { queryByTestId } = render(<Item comment={comment} reverse={true} />);
    expect(
      queryByTestId('TaskDrawerCommentListItemAvatar'),
    ).not.toBeInTheDocument();
  });

  it('has loading state', () => {
    const { queryByTestId } = render(<Item />);
    expect(
      queryByTestId('TaskDrawerCommentListItemAvatar'),
    ).not.toBeInTheDocument();
  });
});
