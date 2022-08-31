import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@mui/material';
import theme from '../../theme';

import { InfiniteList } from './InfiniteList';

const endReached = jest.fn();

describe('InfiniteList', () => {
  it('should show loading indicator', async () => {
    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <InfiniteList
          loading={true}
          data={[]}
          itemContent={(index, item) => <div>{item}</div>}
          endReached={endReached}
          EmptyPlaceholder={<div>No items</div>}
        />
      </ThemeProvider>,
    );

    expect(getByTestId('infinite-list-skeleton-loading')).toBeVisible();
  });

  it('should render data', async () => {
    const { queryByTestId, queryByText, getByText } = render(
      <ThemeProvider theme={theme}>
        <InfiniteList
          loading={false}
          data={['item 1', 'item 2']}
          initialItemCount={2}
          itemContent={(index, item) => <div>{item}</div>}
          endReached={endReached}
          EmptyPlaceholder={<div>No items</div>}
        />
      </ThemeProvider>,
    );

    expect(queryByTestId('infinite-list-skeleton-loading')).toBeNull();
    expect(getByText('item 1')).toBeInTheDocument();
    expect(getByText('item 2')).toBeInTheDocument();
    expect(queryByText('No items')).toBeNull();
    expect(endReached).not.toHaveBeenCalled();
  });

  it('should render data with headers', async () => {
    const { queryByTestId, queryByText, getByText } = render(
      <ThemeProvider theme={theme}>
        <InfiniteList
          loading={false}
          data={['item 1', 'item 2']}
          initialItemCount={2}
          groupBy={(item) => item[0].toUpperCase()}
          itemContent={(index, item) => <div>{item}</div>}
          endReached={endReached}
          EmptyPlaceholder={<div>No items</div>}
        />
      </ThemeProvider>,
    );

    expect(queryByTestId('infinite-list-skeleton-loading')).toBeNull();
    expect(getByText('I')).toBeInTheDocument();
    expect(getByText('item 1')).toBeInTheDocument();
    expect(getByText('item 2')).toBeInTheDocument();
    expect(queryByText('No items')).toBeNull();
    expect(endReached).not.toHaveBeenCalled();
  });

  it('empty', async () => {
    const { queryByTestId, getByText } = render(
      <ThemeProvider theme={theme}>
        <InfiniteList
          loading={false}
          data={[]}
          initialItemCount={0}
          itemContent={(index, item) => <div>{item}</div>}
          endReached={endReached}
          EmptyPlaceholder={<div>No items</div>}
        />
      </ThemeProvider>,
    );

    expect(queryByTestId('infinite-list-skeleton-loading')).toBeNull();
    expect(getByText('No items')).toBeInTheDocument();
  });
});
