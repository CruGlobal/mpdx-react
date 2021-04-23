import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@material-ui/core';
import { GetCommentsForTaskDrawerCommentListQuery } from '../TaskListComments.generated';
import theme from '../../../../../theme';
import Item from '.';

describe('Item', () => {
  const comment: GetCommentsForTaskDrawerCommentListQuery['task']['comments']['nodes'][0] = {
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
    const { getByTestId, getByText } = render(
      <ThemeProvider theme={theme}>
        <Item comment={comment} />
      </ThemeProvider>,
    );
    expect(getByTestId('TaskDrawerCommentListItemAvatar')).toBeInTheDocument();
    expect(
      getByText('The quick brown fox jumped over the lazy dog.'),
    ).toBeInTheDocument();
    expect(getByText('B')).toBeInTheDocument();
    expect(getByText('in 30 days')).toBeInTheDocument();
  });

  it('has correct overrides', () => {
    const { queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <Item comment={comment} reverse={true} />
      </ThemeProvider>,
    );
    expect(
      queryByTestId('TaskDrawerCommentListItemAvatar'),
    ).not.toBeInTheDocument();
  });

  it('has loading state', () => {
    const { queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <Item />
      </ThemeProvider>,
    );
    expect(
      queryByTestId('TaskDrawerCommentListItemAvatar'),
    ).not.toBeInTheDocument();
  });
});
