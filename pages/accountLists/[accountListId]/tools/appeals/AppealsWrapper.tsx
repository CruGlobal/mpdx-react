import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';
import { AppealsProvider } from 'src/components/Tool/Appeal/ContactsContext/AppealsContext';
import { ContactFilterSetInput } from 'src/graphql/types.generated';
import { suggestArticles } from 'src/lib/helpScout';
import { sanitizeFilters } from 'src/lib/sanitizeFilters';

interface Props {
  children?: React.ReactNode;
}

export enum PageEnum {
  InitialPage = 'InitialPage',
  DetailsPage = 'DetailsPage',
  ContactsPage = 'ContactsPage',
}

export const AppealsWrapper: React.FC<Props> = ({ children }) => {
  const router = useRouter();
  const { query, replace, pathname, isReady } = router;

  const urlFilters =
    query?.filters && JSON.parse(decodeURI(query.filters as string));

  const [activeFilters, setActiveFilters] = useState<ContactFilterSetInput>(
    urlFilters ?? {},
  );
  const [starredFilter, setStarredFilter] = useState<ContactFilterSetInput>({});
  const [filterPanelOpen, setFilterPanelOpen] = useState<boolean>(false);
  const [page, setPage] = useState<PageEnum>();
  const [appealId, setAppealId] = useState<string | undefined>(undefined);
  const [contactId, setContactId] = useState<string | string[] | undefined>(
    undefined,
  );
  const sanitizedFilters = useMemo(
    () => sanitizeFilters(activeFilters),
    [activeFilters],
  );

  const { appealId: appealIdParams, searchTerm } = query;

  useEffect(() => {
    // TODO: Fix these suggested Articles
    suggestArticles(
      appealIdParams
        ? 'HS_CONTACTS_CONTACT_SUGGESTIONS'
        : 'HS_CONTACTS_SUGGESTIONS',
    );
    if (appealIdParams === undefined) {
      setPage(PageEnum.InitialPage);
      return;
    }
    const length = appealIdParams.length;
    setAppealId(appealIdParams[0]);
    if (length === 1) {
      setPage(PageEnum.DetailsPage);
    } else if (
      length === 2 &&
      (appealIdParams[1].toLowerCase() === 'flows' ||
        appealIdParams[1].toLowerCase() === 'list')
    ) {
      setPage(PageEnum.DetailsPage);
      setContactId([appealIdParams[1]]);
    } else if (length > 2) {
      setPage(PageEnum.ContactsPage);
      const appealIdParamsCopy = [...appealIdParams];
      setContactId(appealIdParamsCopy.shift());
    }
  }, [appealIdParams]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

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
  }, [sanitizedFilters, isReady]);

  return (
    <AppealsProvider
      urlFilters={urlFilters}
      activeFilters={activeFilters}
      setActiveFilters={setActiveFilters}
      starredFilter={starredFilter}
      setStarredFilter={setStarredFilter}
      filterPanelOpen={filterPanelOpen}
      setFilterPanelOpen={setFilterPanelOpen}
      appealId={appealId}
      contactId={contactId}
      searchTerm={searchTerm}
      page={page}
    >
      {children}
    </AppealsProvider>
  );
};
