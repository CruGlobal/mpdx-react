import React from 'react';
import { Skeleton } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { VirtuosoMockContext } from 'react-virtuoso';
import theme from '../../theme';
import { InfiniteList } from './InfiniteList';

const RowSkeleton: React.FC = () => (
  <div data-testid="row-skeleton">
    <Skeleton width={'100%'} height={42} style={{ maxWidth: '300px' }} />
    <Skeleton width={'100%'} height={20} style={{ maxWidth: '360px' }} />
  </div>
);

const endReached = jest.fn();

describe('InfiniteList', () => {
  it('should show loading indicator', async () => {
    const { getAllByTestId } = render(
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

    expect(getAllByTestId('infinite-list-skeleton-loading').length).toBe(2);
  });

  it('should show custom skeletons', async () => {
    const { getAllByTestId } = render(
      <ThemeProvider theme={theme}>
        <InfiniteList
          loading={true}
          Skeleton={RowSkeleton}
          numberOfSkeletons={10}
          data={[]}
          itemContent={(index, item) => <div>{item}</div>}
          endReached={() => true}
          EmptyPlaceholder={<div>No items</div>}
        />
      </ThemeProvider>,
    );

    expect(getAllByTestId('infinite-list-skeleton-loading').length).toBe(2);
    // 10 skeletons for loading, and another 10 for next items
    expect(getAllByTestId('row-skeleton').length).toBe(20);
  });

  it('does not show loading when items are present', async () => {
    const { getAllByTestId } = render(
      <ThemeProvider theme={theme}>
        <InfiniteList
          loading={true}
          data={['item 1']}
          itemContent={(index, item) => <div>{item}</div>}
          endReached={endReached}
          EmptyPlaceholder={<div>No items</div>}
        />
      </ThemeProvider>,
    );

    expect(getAllByTestId('infinite-list-skeleton-loading').length).toBe(1);
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

  it('should render data', async () => {
    const { queryByTestId, queryByText, getByText } = render(
      <ThemeProvider theme={theme}>
        <VirtuosoMockContext.Provider
          value={{ viewportHeight: 300, itemHeight: 100 }}
        >
          <InfiniteList
            loading={false}
            data={['item 1', 'item 2']}
            initialItemCount={2}
            itemContent={(index, item) => <div>{item}</div>}
            endReached={endReached}
            EmptyPlaceholder={<div>No items</div>}
          />
        </VirtuosoMockContext.Provider>
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
        <VirtuosoMockContext.Provider
          value={{ viewportHeight: 300, itemHeight: 100 }}
        >
          <InfiniteList
            loading={false}
            data={['item 1', 'item 2']}
            initialItemCount={2}
            groupBy={(item) => ({ label: item[0].toUpperCase() })}
            itemContent={(index, item) => <div>{item}</div>}
            endReached={endReached}
            EmptyPlaceholder={<div>No items</div>}
          />
        </VirtuosoMockContext.Provider>
      </ThemeProvider>,
    );

    expect(queryByTestId('infinite-list-skeleton-loading')).toBeNull();
    expect(getByText('I')).toBeInTheDocument();
    expect(getByText('item 1')).toBeInTheDocument();
    expect(getByText('item 2')).toBeInTheDocument();
    expect(queryByText('No items')).toBeNull();
    expect(endReached).not.toHaveBeenCalled();
  });
});
