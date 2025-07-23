import { ParsedUrlQuery } from 'node:querystring';
import React from 'react';
import { waitFor } from '@testing-library/dom';
import { act, renderHook } from '@testing-library/react-hooks';
import { omit } from 'lodash';
import TestRouter from '__tests__/util/TestRouter';
import { ContactFilterSetInput } from 'src/graphql/types.generated';
import { UrlFiltersProvider, useUrlFilters } from './UrlFiltersProvider';

describe('useUrlFilters', () => {
  const replace = jest.fn();
  const pathname = '/page';
  const router = {
    replace,
    pathname,
    query: {
      filters: '{"key":"value"}',
      searchTerm: 'Search',
    },
  };

  const sanitizeFilters = (filters: ContactFilterSetInput) =>
    omit(filters, 'contactIds');

  const Wrapper: React.FC<{
    query?: ParsedUrlQuery;
    children?: React.ReactNode;
  }> = ({ query, children }) => (
    <TestRouter router={{ ...router, query: query ?? router.query }}>
      <UrlFiltersProvider sanitizeFilters={sanitizeFilters}>
        {children}
      </UrlFiltersProvider>
    </TestRouter>
  );

  it('should extract the initial state from the URL query', () => {
    const { result } = renderHook(() => useUrlFilters(), {
      wrapper: Wrapper,
    });

    expect(result.current.activeFilters).toEqual({ key: 'value' });
    expect(result.current.searchTerm).toBe('Search');
  });

  it('should update the filters when the URL query changes', () => {
    const { result, rerender } = renderHook(() => useUrlFilters(), {
      wrapper: Wrapper,
    });

    rerender({ query: { filters: '{"key2":"value2"}' } });

    expect(result.current.activeFilters).toEqual({ key2: 'value2' });
  });

  it('should update the search term when the URL query changes', () => {
    const { result, rerender } = renderHook(() => useUrlFilters(), {
      wrapper: Wrapper,
    });

    rerender({ query: { searchTerm: 'New search' } });

    expect(result.current.searchTerm).toBe('New search');
  });

  it('should update the URL query when the filters change', () => {
    const { result } = renderHook(() => useUrlFilters(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.setActiveFilters({ ids: ['contact-1'] });
    });

    expect(replace).toHaveBeenCalledWith(
      {
        pathname,
        query: { filters: '{"ids":["contact-1"]}', searchTerm: 'Search' },
      },
      undefined,
      { shallow: true },
    );
  });

  it('should update the URL query when the search term changes', async () => {
    const { result } = renderHook(() => useUrlFilters(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.setSearchTerm('New Search');
    });

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith(
        {
          pathname,
          query: {
            filters: '{"key":"value"}',
            searchTerm: 'New Search',
          },
        },
        undefined,
        { shallow: true },
      );
    });
  });

  it('should remove empty filters and search terms from the URL query', async () => {
    const { result } = renderHook(() => useUrlFilters(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.setActiveFilters({});
      result.current.setSearchTerm('');
    });

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith(
        {
          pathname,
          query: {},
        },
        undefined,
        {
          shallow: true,
        },
      );
    });
  });

  it('should clear the search term', async () => {
    const { result } = renderHook(() => useUrlFilters(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.clearSearchTerm();
    });

    expect(result.current.searchTerm).toBe('');

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith(
        {
          pathname,
          query: {
            filters: '{"key":"value"}',
          },
        },
        undefined,
        { shallow: true },
      );
    });
  });

  it('should debounce search term changes', async () => {
    const { result } = renderHook(() => useUrlFilters(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.setSearchTerm('New Search');
    });

    act(() => {
      result.current.setSearchTerm('New Search 2');
    });

    act(() => {
      result.current.setSearchTerm('New Search 3');
    });

    await waitFor(() => {
      expect(replace).toHaveBeenCalledTimes(1);
    });
  });

  it('should sanitize the filters before updating the URL', () => {
    const { result } = renderHook(() => useUrlFilters(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.setActiveFilters({
        ids: ['contact-1'],
        contactIds: ['contact-1'],
      });
    });

    // activeFilters should contain all filters
    expect(result.current.activeFilters).toEqual({
      contactIds: ['contact-1'],
      ids: ['contact-1'],
    });

    // The URL should be updated with the sanitized filters
    expect(replace).toHaveBeenCalledWith(
      {
        pathname,
        query: {
          filters: '{"ids":["contact-1"]}',
          searchTerm: 'Search',
        },
      },
      undefined,
      { shallow: true },
    );
  });

  it('should not update the URL when the starred filter changes', () => {
    const { result } = renderHook(() => useUrlFilters(), {
      wrapper: Wrapper,
    });

    expect(result.current.starred).toBe(false);

    act(() => {
      result.current.setStarred(true);
    });

    expect(result.current.starred).toBe(true);
    expect(replace).not.toHaveBeenCalled();
  });

  it('should calculate combinedFilters', () => {
    const { result } = renderHook(() => useUrlFilters(), {
      wrapper: Wrapper,
    });

    expect(result.current.combinedFilters).toEqual({
      key: 'value',
      wildcardSearch: 'Search',
    });

    act(() => {
      result.current.setActiveFilters({ ids: ['contact-1'] });
      result.current.setSearchTerm('New search');
      result.current.setStarred(true);
    });

    expect(result.current.combinedFilters).toEqual({
      ids: ['contact-1'],
      wildcardSearch: 'Search',
      starred: true,
    });
  });
});
