import { ParsedUrlQueryInput } from 'querystring';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';
import { ContactsProvider } from 'src/components/Contacts/ContactsContext/ContactsContext';
import { TableViewModeEnum } from 'src/components/Shared/Header/ListHeader';
import { ContactFilterSetInput } from 'src/graphql/types.generated';
import { sanitizeFilters } from 'src/lib/sanitizeFilters';

interface Props {
  children?: React.ReactNode;
}

export const ContactsWrapper: React.FC<Props> = ({ children }) => {
  const router = useRouter();
  const { query, replace, pathname } = router;
  const { accountListId } = query;

  // Extract the initial contact id from the URL
  const [contactId, setContactId] = useState<string | undefined>(() => {
    const contactId = query.contactId?.at(-1);
    if (
      !contactId ||
      (Object.values(TableViewModeEnum) as string[]).includes(contactId)
    ) {
      return undefined;
    } else {
      return contactId;
    }
  });
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

  const [activeFilters, setActiveFilters] = useState<ContactFilterSetInput>(
    typeof query.filters === 'string'
      ? JSON.parse(decodeURIComponent(query.filters))
      : {},
  );
  const [starredFilter, setStarredFilter] = useState<ContactFilterSetInput>({});
  const [searchTerm, setSearchTerm] = useState(
    typeof query.searchTerm === 'string' ? query.searchTerm : '',
  );
  const [filterPanelOpen, setFilterPanelOpen] = useState(true);

  const urlQuery = useMemo(() => {
    const query: ParsedUrlQueryInput = {
      accountListId,
    };
    const queryContactId: string[] = [];
    if (viewMode !== TableViewModeEnum.List) {
      queryContactId.push(viewMode);
    }
    if (contactId) {
      queryContactId.push(contactId);
    }
    query.contactId = queryContactId;
    const sanitizedFilters = sanitizeFilters(activeFilters);
    if (
      viewMode !== TableViewModeEnum.Map &&
      Object.keys(sanitizedFilters).length
    ) {
      query.filters = encodeURIComponent(JSON.stringify(sanitizedFilters));
    }
    if (searchTerm) {
      query.searchTerm = encodeURIComponent(searchTerm);
    }
    return query;
  }, [accountListId, contactId, viewMode, activeFilters, searchTerm]);

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
