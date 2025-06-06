import { ParsedUrlQuery } from 'node:querystring';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { omit } from 'lodash';
import { ContactsProvider } from 'src/components/Contacts/ContactsContext/ContactsContext';
import { TableViewModeEnum } from 'src/components/Shared/Header/ListHeader';
import {
  ContactFilterSetInput,
  TaskFilterSetInput,
} from 'src/graphql/types.generated';
import { useUserPreference } from 'src/hooks/useUserPreference';
import { sanitizeFilters } from 'src/lib/sanitizeFilters';
import { getQueryParam } from 'src/utils/queryParam';

export type GetContactHrefObject = (contactId?: string) => {
  pathname: string;
  query: {
    [key: string]: string | string[] | undefined;
  };
};
interface Props {
  children?: React.ReactNode;
  addViewMode?: boolean;
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

export const ContactsWrapper: React.FC<Props> = ({
  children,
  addViewMode = false,
}) => {
  const router = useRouter();
  const { query, replace, pathname } = router;
  const { accountListId } = query;

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

  const [activeFiltersRaw, setActiveFilters] = useState<
    ContactFilterSetInput & TaskFilterSetInput
  >(JSON.parse(decodeURIComponent(getQueryParam(query, 'filters') ?? '{}')));
  const [starredFilter, setStarredFilter] = useState<
    ContactFilterSetInput & TaskFilterSetInput
  >({});
  const [searchTerm, setSearchTerm] = useState(
    getQueryParam(query, 'searchTerm') ?? '',
  );
  const [filterPanelOpen, setFilterPanelOpen] = useUserPreference({
    key: 'contact_filters_collapse',
    defaultValue: false,
  });

  // Only allow the ids filter in map view, and remove the ids filter in other views
  const activeFilters = useMemo(() => {
    if (viewMode === TableViewModeEnum.Map) {
      return activeFiltersRaw;
    } else {
      return omit(activeFiltersRaw, 'ids');
    }
  }, [viewMode, activeFiltersRaw]);

  const shouldOmitPersonId = (
    currentContactId: string | undefined,
    newContactId?: string,
  ): boolean => {
    return !!newContactId && newContactId !== currentContactId;
  };

  const buildQueryWithoutKeys = (
    query: ParsedUrlQuery,
    keysToOmit: string[],
  ): Record<string, string | string[] | undefined> => {
    return omit(query, keysToOmit);
  };

  const getContactHrefObject: GetContactHrefObject = useCallback(
    (newContactId?: string) => {
      // Omit the filters and searchTerm from the previous query because we don't want them in the URL
      // if they are empty and Next.js will still add them to the URL query even if they are undefined.
      // i.e. { filters: undefined, searchTerm: '' } results in a querystring of ?filters=&searchTerm

      const currentContactId = extractContactId(query);

      const keysToOmit = ['filters', 'searchTerm'];

      // Only omit `personId` if the contactId is changing
      if (shouldOmitPersonId(currentContactId, newContactId)) {
        keysToOmit.push('personId');
      }

      const newQuery = buildQueryWithoutKeys(query, keysToOmit);

      const queryContactId: string[] = [];
      if (addViewMode && viewMode !== TableViewModeEnum.List) {
        queryContactId.push(viewMode);
      }
      if (newContactId) {
        queryContactId.push(newContactId);
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
    [accountListId, viewMode, activeFilters, searchTerm, pathname],
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
      getContactHrefObject={getContactHrefObject}
      viewMode={viewMode}
      setViewMode={setViewMode}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
    >
      {children}
    </ContactsProvider>
  );
};
