import { renderHook } from '@testing-library/react-hooks';
import { useFetchAllPages } from './useFetchAllPages';

describe('useFetchAllPages', () => {
  const fetchMore = jest.fn();

  it('only loads when page info is available', () => {
    const { result } = renderHook(() =>
      useFetchAllPages({ pageInfo: undefined, fetchMore }),
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
        pageInfo: {
          hasNextPage: page <= 3,
          endCursor: page > 3 ? undefined : `A${page}`,
        },
        fetchMore,
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
});
