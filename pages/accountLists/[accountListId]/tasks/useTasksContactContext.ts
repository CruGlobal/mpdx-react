import { ParsedUrlQuery } from 'node:querystring';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ContactsContextProps } from 'src/components/Contacts/ContactsContext/ContactsContext';
import { TaskFilterSetInput } from 'src/graphql/types.generated';
import { sanitizeFilters } from 'src/lib/sanitizeFilters';
import { getQueryParam } from 'src/utils/queryParam';
import { GetContactHrefObject } from '../contacts/ContactsWrapper';

/*
 * Extract the contact id from the contactId query param.
 */
export const extractContactId = (query: ParsedUrlQuery): string | undefined => {
  return query.contactId?.at(-1);
};

/*
 * Return the props that will be needed to setup <ContactsContext> for the tasks page. They are all
 * related to storing the active filters and the focused contact id and keeping the URL in sync with
 * the filters and contact id.
 */
export const useTasksContactContext = (): Omit<
  ContactsContextProps,
  'contactId' | 'setContactId'
> => {
  const router = useRouter();
  const { query, replace, pathname } = router;
  const { accountListId } = query;

  // Extract the initial contact id from the URL
  const contactId = extractContactId(query);

  const [activeFilters, setActiveFilters] = useState<TaskFilterSetInput>(
    JSON.parse(decodeURIComponent(getQueryParam(query, 'filters') ?? '{}')),
  );
  const [starredFilter, setStarredFilter] = useState<TaskFilterSetInput>({});
  const [searchTerm, setSearchTerm] = useState(
    getQueryParam(query, 'searchTerm') ?? '',
  );
  const [filterPanelOpen, setFilterPanelOpen] = useState(true);

  const getContactHrefObject: GetContactHrefObject = useCallback(
    (contactId?: string) => {
      // Omit the filters and searchTerm from the previous query because we don't want them in the URL
      // if they are empty and Next.js will still add them to the URL query even if they are undefined.
      // i.e. { filters: undefined, searchTerm: '' } results in a querystring of ?filters=&searchTerm=
      const { filters: _filters, searchTerm: _searchTerm, ...newQuery } = query;

      const queryContactId: string[] = [];
      if (contactId) {
        queryContactId.push(contactId);
      }
      newQuery.contactId = queryContactId;

      const sanitizedFilters = sanitizeFilters(activeFilters);
      if (Object.keys(sanitizedFilters).length) {
        newQuery.filters = encodeURIComponent(JSON.stringify(sanitizedFilters));
      }

      if (searchTerm) {
        newQuery.searchTerm = encodeURIComponent(searchTerm);
      }

      return {
        pathname,
        query: newQuery,
      };
    },
    [accountListId, activeFilters, searchTerm, pathname],
  );

  const urlQuery = useMemo(() => {
    return getContactHrefObject(contactId).query;
  }, [contactId, getContactHrefObject]);

  useEffect(() => {
    replace({
      pathname,
      query: urlQuery,
    });
  }, [urlQuery]);

  return {
    activeFilters,
    setActiveFilters,
    starredFilter,
    setStarredFilter,
    filterPanelOpen,
    setFilterPanelOpen,
    getContactHrefObject,
    searchTerm,
    setSearchTerm,
  };
};
