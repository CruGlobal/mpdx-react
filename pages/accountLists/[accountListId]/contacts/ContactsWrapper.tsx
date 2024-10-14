import { ParsedUrlQueryInput } from 'querystring';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';
import { ContactsProvider } from 'src/components/Contacts/ContactsContext/ContactsContext';
import { ContactFilterSetInput } from 'src/graphql/types.generated';
import { sanitizeFilters } from 'src/lib/sanitizeFilters';

interface Props {
  children?: React.ReactNode;
}

export const ContactsWrapper: React.FC<Props> = ({ children }) => {
  const router = useRouter();
  const { query, replace, pathname } = router;
  const { accountListId, contactId } = query;

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
    if (contactId) {
      query.contactId = contactId;
    }
    const sanitizedFilters = sanitizeFilters(activeFilters);
    if (Object.keys(sanitizedFilters).length) {
      query.filters = encodeURIComponent(JSON.stringify(sanitizedFilters));
    }
    if (searchTerm) {
      query.searchTerm = encodeURIComponent(searchTerm);
    }
    return query;
  }, [accountListId, contactId, activeFilters, searchTerm]);

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
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
    >
      {children}
    </ContactsProvider>
  );
};
