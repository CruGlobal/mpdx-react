import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { useRouter } from 'next/router';
import { ContactsProvider } from './ContactsContext';
import { ContactFilterSetInput } from '../../../../graphql/types.generated';

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

  const { contactId, searchTerm } = query;

  useEffect(() => {
    const { filters: _, ...oldQuery } = query;
    replace({
      pathname,
      query: {
        ...oldQuery,
        ...(Object.keys(activeFilters).length > 0
          ? { filters: encodeURI(JSON.stringify(activeFilters)) }
          : undefined),
      },
    });
  }, [activeFilters]);

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
