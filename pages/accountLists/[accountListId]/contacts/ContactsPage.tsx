import React, { useEffect, useMemo, useState } from 'react';
import _ from 'lodash';
import { useRouter } from 'next/router';
import { suggestArticles } from 'src/lib/helpScout';
import { sanitizeFilters } from 'src/lib/sanitizeFilters';
import { ContactFilterSetInput } from '../../../../graphql/types.generated';
import { ContactsProvider } from './ContactsContext';

interface Props {
  children?: React.ReactNode;
}
export const ContactsPage: React.FC<Props> = ({ children }) => {
  const router = useRouter();
  const { query, replace, pathname } = router;

  const urlFilters =
    query?.filters && JSON.parse(decodeURI(query.filters as string));

  const [activeFilters, setActiveFilters] = useState<ContactFilterSetInput>(
    urlFilters ?? {},
  );
  const [starredFilter, setStarredFilter] = useState<ContactFilterSetInput>({});
  const [filterPanelOpen, setFilterPanelOpen] = useState<boolean>(false);
  const sanitizedFilters = useMemo(
    () => sanitizeFilters(activeFilters),
    [activeFilters],
  );

  const { contactId, searchTerm } = query;

  useEffect(() => {
    const { filters: _, ...oldQuery } = query;
    replace({
      pathname,
      query: {
        ...oldQuery,
        ...(Object.keys(sanitizedFilters).length
          ? { filters: encodeURI(JSON.stringify(sanitizedFilters)) }
          : undefined),
      },
    });
  }, [sanitizedFilters]);

  useEffect(() => {
    suggestArticles(
      contactId ? 'HS_CONTACTS_CONTACT_SUGGESTIONS' : 'HS_CONTACTS_SUGGESTIONS',
    );
  }, [contactId]);

  return (
    <ContactsProvider
      urlFilters={urlFilters}
      activeFilters={activeFilters}
      setActiveFilters={setActiveFilters}
      starredFilter={starredFilter}
      setStarredFilter={setStarredFilter}
      filterPanelOpen={filterPanelOpen}
      setFilterPanelOpen={setFilterPanelOpen}
      contactId={contactId}
      searchTerm={searchTerm}
    >
      {children}
    </ContactsProvider>
  );
};
