import { ParsedUrlQuery } from 'node:querystring';
import { useRouter } from 'next/router';
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { omit } from 'lodash';
import {
  ContactFilterSetInput,
  TaskFilterSetInput,
} from 'src/graphql/types.generated';
import { useDebouncedCallback } from 'src/hooks/useDebounce';
import { sanitizeFilters } from 'src/lib/sanitizeFilters';
import { getQueryParam } from 'src/utils/queryParam';

type Filter = ContactFilterSetInput & TaskFilterSetInput;

export interface UrlFilters {
  activeFilters: Filter;
  setActiveFilters: (newFilters: Filter) => void;
  searchTerm: string;
  setSearchTerm: (newSearchTerm: string) => void;
}

const UrlFiltersContext = createContext<UrlFilters | null>(null);

export const useUrlFilters = (): UrlFilters => {
  const context = useContext(UrlFiltersContext);
  if (context === null) {
    throw new Error(
      'Could not find UrlFiltersContext. Make sure that your component is inside <UrlFiltersProvider>.',
    );
  }
  return context;
};

/**
 * Extract the filters from the URL query params.
 *
 * @param query The query params from the router
 * @returns The URL filters
 */
export const getQueryFilters = (query: ParsedUrlQuery) =>
  JSON.parse(decodeURIComponent(getQueryParam(query, 'filters') ?? '{}'));

export interface UrlFiltersProviderProps {
  children: ReactNode;
}

export const UrlFiltersProvider: React.FC<UrlFiltersProviderProps> = ({
  children,
}) => {
  const { query, pathname, replace } = useRouter();

  // Extract the initial filters from the URL
  const [activeFilters, setActiveFilters] = useState<Filter>(
    getQueryFilters(query),
  );
  const [searchTerm, setSearchTerm] = useState(
    getQueryParam(query, 'searchTerm') ?? '',
  );

  // Update the filters when the URL changes
  useEffect(() => {
    setActiveFilters(getQueryFilters(query));
  }, [query]);

  const setSearchTermDebounced = useDebouncedCallback(setSearchTerm, 500);

  // Update the URL when the active filters or the search term changes
  useEffect(() => {
    // Omit the filters and searchTerm from the previous query because we don't want them in the URL
    // if they are empty and Next.js will still add them to the URL query even if they are undefined.
    // i.e. { filters: undefined, searchTerm: '' } results in a querystring of ?filters=&searchTerm=
    const urlQuery = omit(query, ['filters', 'searchTerm']);

    if (Object.keys(activeFilters).length) {
      urlQuery.filters = encodeURIComponent(
        JSON.stringify(sanitizeFilters(activeFilters)),
      );
    }
    if (searchTerm) {
      urlQuery.searchTerm = searchTerm;
    }

    // Avoid an infinite loop by only updating the URL if the query has actually changed
    if (
      urlQuery.filters !== query.filters ||
      urlQuery.searchTerm !== query.searchTerm
    ) {
      replace(
        {
          pathname,
          query: urlQuery,
        },
        undefined,
        { shallow: true },
      );
    }
  }, [activeFilters, searchTerm]);

  return (
    <UrlFiltersContext.Provider
      value={{
        activeFilters,
        setActiveFilters,
        searchTerm,
        setSearchTerm: setSearchTermDebounced,
      }}
    >
      {children}
    </UrlFiltersContext.Provider>
  );
};
