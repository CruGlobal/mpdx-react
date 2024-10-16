import { ParsedUrlQuery } from 'node:querystring';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';
import { ContactsProvider } from 'src/components/Contacts/ContactsContext/ContactsContext';
import { TableViewModeEnum } from 'src/components/Shared/Header/ListHeader';
import {
  ContactFilterSetInput,
  TaskFilterSetInput,
} from 'src/graphql/types.generated';
import { sanitizeFilters } from 'src/lib/sanitizeFilters';

interface Props {
  children?: React.ReactNode;
}

/*
 * Extract the contact id from the contactId query param, which is an array that may also contain
 * the view mode.
 */
export const extractContactId = (query: ParsedUrlQuery): string | undefined => {
  const contactId = query.contactId?.at(-1);
  if (
    !contactId ||
    (Object.values(TableViewModeEnum) as string[]).includes(contactId)
  ) {
    return undefined;
  } else {
    return contactId;
  }
};

export const ContactsWrapper: React.FC<Props> = ({ children }) => {
  const router = useRouter();
  const { query, replace, pathname } = router;

  // Extract the initial contact id from the URL
  const [contactId, setContactId] = useState<string | undefined>(() =>
    extractContactId(query),
  );
  // Update the contact id when the URL changes
  useEffect(() => {
    setContactId(extractContactId(query));
  }, [query]);

  // Extract the initial view mode from the URL
  const [viewMode, setViewMode] = useState(() => {
    const viewMode = query.contactId?.[0];
    if (
      viewMode &&
      (Object.values(TableViewModeEnum) as string[]).includes(viewMode)
    ) {
      return viewMode as TableViewModeEnum;
    } else {
      return TableViewModeEnum.List;
    }
  });

  const [activeFilters, setActiveFilters] = useState<
    ContactFilterSetInput & TaskFilterSetInput
  >(
    typeof query.filters === 'string'
      ? JSON.parse(decodeURIComponent(query.filters))
      : {},
  );
  const [starredFilter, setStarredFilter] = useState<
    ContactFilterSetInput & TaskFilterSetInput
  >({});
  const [searchTerm, setSearchTerm] = useState(
    typeof query.searchTerm === 'string' ? query.searchTerm : '',
  );
  const [filterPanelOpen, setFilterPanelOpen] = useState(true);

  const urlQuery = useMemo(() => {
    // Omit the filters and searchTerm from the previous query because we don't want them in the URL
    // if they are empty and Next.js will still add them to the URL query even if they are undefined.
    // i.e. { filters: undefined, searchTerm: '' } results in a querystring of ?filters=&searchTerm
    const { filters: _filters, searchTerm: _searchTerm, ...newQuery } = query;

    const queryContactId: string[] = [];
    if (viewMode !== TableViewModeEnum.List) {
      queryContactId.push(viewMode);
    }
    if (contactId) {
      queryContactId.push(contactId);
    }
    newQuery.contactId = queryContactId;

    const sanitizedFilters = sanitizeFilters(activeFilters);
    if (
      viewMode !== TableViewModeEnum.Map &&
      Object.keys(sanitizedFilters).length
    ) {
      newQuery.filters = encodeURIComponent(JSON.stringify(sanitizedFilters));
    }

    if (searchTerm) {
      newQuery.searchTerm = encodeURIComponent(searchTerm);
    }
    return newQuery;
  }, [contactId, viewMode, activeFilters, searchTerm]);

  useEffect(() => {
    replace({
      pathname,
      query: urlQuery,
    });
  }, [urlQuery]);

  return (
    <ContactsProvider
      activeFilters={activeFilters}
      setActiveFilters={setActiveFilters}
      starredFilter={starredFilter}
      setStarredFilter={setStarredFilter}
      filterPanelOpen={filterPanelOpen}
      setFilterPanelOpen={setFilterPanelOpen}
      contactId={contactId}
      setContactId={setContactId}
      viewMode={viewMode}
      setViewMode={setViewMode}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
    >
      {children}
    </ContactsProvider>
  );
};
