import { ParsedUrlQuery } from 'node:querystring';
import { useRouter } from 'next/router';
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { omit } from 'lodash';
import {
  ContactFilterSetInput,
  TaskFilterSetInput,
} from 'src/graphql/types.generated';
import { useDebouncedCallback } from 'src/hooks/useDebounce';
import { getQueryParam } from 'src/utils/queryParam';

type Filter = ContactFilterSetInput & TaskFilterSetInput;
type DefaultFilters = Record<string, unknown>;

export interface UrlFilters<
  Filters extends Record<string, unknown> = DefaultFilters,
> {
  activeFilters: Filters;
  setActiveFilters: (newFilters: Filters) => void;
  isFiltered: boolean;
  combinedFilters: Filters;
  searchTerm: string;
  setSearchTerm: (newSearchTerm: string) => void;
  starred: boolean;
  setStarred: (starred: boolean) => void;
  clearFilters: () => void;
}

const UrlFiltersContext = createContext<UrlFilters | null>(null);

export const useUrlFilters = <
  Filters extends Record<string, unknown> = DefaultFilters,
>(): UrlFilters<Filters> => {
  const context = useContext(UrlFiltersContext);
  if (context === null) {
    throw new Error(
      'Could not find UrlFiltersContext. Make sure that your component is inside <UrlFiltersProvider>.',
    );
  }
  return context as UrlFilters<Filters>;
};

/**
 * Extract the filters from the URL query params.
 *
 * @param query The query params from the router
 * @returns The URL filters, or null if they are missing or invalid
 */
export const getQueryFilters = (
  query: ParsedUrlQuery,
): DefaultFilters | null => {
  try {
    return JSON.parse(
      decodeURIComponent(getQueryParam(query, 'filters') ?? ''),
    );
  } catch {
    // The filters are missing or invalid
    return null;
  }
};

export interface UrlFiltersProviderProps {
  /**
   * If there are no filters initially set in the URL, use these filters.
   */
  defaultInitialFilters?: DefaultFilters;

  /**
   * Optional function to transform the filters before adding them to the URL. It can be used to
   * remove fields from the filters, for example.
   */
  sanitizeFilters?: (filters: Filter) => Filter;

  children: ReactNode;
}

export const UrlFiltersProvider: React.FC<UrlFiltersProviderProps> = ({
  sanitizeFilters,
  defaultInitialFilters,
  children,
}) => {
  const router = useRouter();
  const query = useMemo(
    () => router.query,
    // Memoize by the JSON string to ensure stability when the query changes to an equivalent object
    [JSON.stringify(router.query)],
  );

  // Extract the initial filters from the URL
  const [activeFilters, setActiveFilters] = useState<DefaultFilters>(
    getQueryFilters(query) ?? { defaultInitialFilters },
  );
  const [searchTerm, setSearchTerm] = useState(
    getQueryParam(query, 'searchTerm') ?? '',
  );

  // The starred filter is not added to the URL
  const [starred, setStarred] = useState(false);

  // Update the filters and search term when the URL changes
  useEffect(() => {
    setActiveFilters(getQueryFilters(query) ?? {});
    setSearchTerm(getQueryParam(query, 'searchTerm') ?? '');
  }, [query]);

  const setSearchTermDebounced = useDebouncedCallback(setSearchTerm, 500);

  const clearFilters = useCallback(() => {
    setActiveFilters({});
    setSearchTerm('');
  }, []);

  const isFiltered = useMemo(
    () => Object.keys(activeFilters).length > 0,
    [activeFilters],
  );

  // Update the URL when the active filters or the search term changes
  useEffect(() => {
    // Omit the filters and searchTerm from the previous query because we don't want them in the URL
    // if they are empty and Next.js will still add them to the URL query even if they are undefined.
    // i.e. { filters: undefined, searchTerm: '' } results in a querystring of ?filters=&searchTerm=
    const urlQuery = omit(query, ['filters', 'searchTerm']);

    const sanitizedFilters = sanitizeFilters
      ? sanitizeFilters(activeFilters)
      : activeFilters;
    if (Object.keys(sanitizedFilters).length) {
      urlQuery.filters = JSON.stringify(sanitizedFilters);
    }
    if (searchTerm) {
      urlQuery.searchTerm = searchTerm;
    }

    // Avoid an infinite loop by only updating the URL if the query has actually changed
    if (
      urlQuery.filters !== query.filters ||
      urlQuery.searchTerm !== query.searchTerm
    ) {
      router.replace(
        {
          pathname: router.pathname,
          query: urlQuery,
        },
        undefined,
        { shallow: true },
      );
    }
  }, [activeFilters, searchTerm]);

  const combinedFilters = useMemo(
    () => ({
      ...activeFilters,
      ...(starred && { starred: true }),
      wildcardSearch: searchTerm,
    }),
    [activeFilters, searchTerm, starred],
  );

  const contextValue = useMemo(
    () => ({
      activeFilters,
      setActiveFilters,
      isFiltered,
      searchTerm,
      setSearchTerm: setSearchTermDebounced,
      starred,
      setStarred,
      clearFilters,
      combinedFilters,
    }),
    [
      activeFilters,
      isFiltered,
      searchTerm,
      setSearchTermDebounced,
      starred,
      clearFilters,
      combinedFilters,
    ],
  );

  return (
    <UrlFiltersContext.Provider value={contextValue}>
      {children}
    </UrlFiltersContext.Provider>
  );
};
