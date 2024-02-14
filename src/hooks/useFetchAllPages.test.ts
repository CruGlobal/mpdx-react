import { ApolloError } from '@apollo/client';
import { renderHook } from '@testing-library/react-hooks';
import { useFetchAllPages } from './useFetchAllPages';

describe('useFetchAllPages', () => {
  const fetchMore = jest.fn();

  it('only loads when page info is available', () => {
    const { result } = renderHook(() =>
      useFetchAllPages({
        fetchMore,
        error: undefined,
        pageInfo: undefined,
      }),
    );

    expect(fetchMore).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(true);
  });

  it('fetches remaining pages', () => {
    let page = 0;
    const fetchMore = jest.fn().mockImplementation(() => {
      ++page;
    });

    const { result, rerender } = renderHook(() =>
      useFetchAllPages({
        fetchMore,
        error: undefined,
        pageInfo: {
          endCursor: page > 3 ? undefined : `A${page}`,
          hasNextPage: page <= 3,
        },
      }),
    );

    rerender();
    rerender();
    rerender();
    expect(result.current.loading).toBe(true);

    rerender();
    rerender();
    rerender();

    expect(fetchMore).toHaveBeenCalledTimes(4);
    expect(fetchMore).toHaveBeenCalledWith({ variables: { after: 'A0' } });
    expect(fetchMore).toHaveBeenCalledWith({ variables: { after: 'A1' } });
    expect(fetchMore).toHaveBeenCalledWith({ variables: { after: 'A2' } });
    expect(fetchMore).toHaveBeenCalledWith({ variables: { after: 'A3' } });
    expect(result.current.loading).toBe(false);
  });

  it('sets loading to false when there is an error', () => {
    const { result } = renderHook(() =>
      useFetchAllPages({
        fetchMore,
        error: new ApolloError({}),
        pageInfo: undefined,
      }),
    );

    expect(result.current.loading).toBe(false);
  });
});
