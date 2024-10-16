import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import {
  AppealsContextProps,
  AppealsProvider,
} from 'src/components/Tool/Appeal/AppealsContext/AppealsContext';
import { ContactFilterSetInput } from 'src/graphql/types.generated';
import { sanitizeFilters } from 'src/lib/sanitizeFilters';
import { getQueryParam } from 'src/utils/queryParam';

interface Props {
  children?: React.ReactNode;
}

export enum PageEnum {
  DetailsPage = 'DetailsPage',
  ContactsPage = 'ContactsPage',
}

export const AppealsWrapper: React.FC<Props> = ({ children }) => {
  const router = useRouter();
  const { query, replace, push, pathname } = router;

  const urlFilters =
    query?.filters && JSON.parse(decodeURI(query.filters as string));

  const [activeFilters, setActiveFiltersRaw] = useState<ContactFilterSetInput>(
    urlFilters ?? {},
  );
  const [starredFilter, setStarredFilter] = useState<ContactFilterSetInput>({});
  const [filterPanelOpen, setFilterPanelOpen] = useState<boolean>(false);
  const [page, setPage] = useState<PageEnum>();
  const [appealId, setAppealId] = useState<string | undefined>(undefined);
  const [contactId, setContactId] = useState<string | string[] | undefined>(
    undefined,
  );

  const { appealId: appealIdParams, accountListId } = query;
  const searchTerm = getQueryParam(query, 'searchTerm') ?? '';

  useEffect(() => {
    if (appealIdParams === undefined) {
      push({
        pathname: '/accountLists/[accountListId]/tools/appeals',
        query: {
          accountListId,
        },
      });
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
      setContactId(appealIdParams);
    } else if (length === 3 && appealIdParams[2].toLowerCase() === 'tour') {
      setPage(PageEnum.ContactsPage);
      setContactId(appealIdParams);
    } else if (length > 2) {
      setPage(PageEnum.DetailsPage);
      setContactId(appealIdParams);
    }
  }, [appealIdParams, accountListId]);

  const updateUrlFilters = (filters: ContactFilterSetInput) => {
    const { filters: _, ...oldQuery } = query;

    const sanitizedFilters = sanitizeFilters(filters);

    replace({
      pathname,
      query: {
        ...oldQuery,
        ...(Object.keys(sanitizedFilters).length
          ? { filters: encodeURI(JSON.stringify(sanitizedFilters)) }
          : undefined),
      },
    });
  };

  const setActiveFilters: AppealsContextProps['setActiveFilters'] = (value) => {
    const filters = typeof value === 'function' ? value(activeFilters) : value;
    updateUrlFilters(filters);
    setActiveFiltersRaw(filters);
  };

  // In the future, we should build the URL based on the view, tour, and contactId like in
  // ContactsWrapper. But for now, the contactId and search term are extracted from the URL so we
  // don't need to handle setContactId or setSearchTerm. The contact id and search term are
  // currently set by directly updating the URL.
  const doNothing = () => {};

  return (
    <AppealsProvider
      activeFilters={activeFilters}
      setActiveFilters={setActiveFilters}
      starredFilter={starredFilter}
      setStarredFilter={setStarredFilter}
      filterPanelOpen={filterPanelOpen}
      setFilterPanelOpen={setFilterPanelOpen}
      appealId={appealId}
      contactId={contactId}
      setContactId={doNothing}
      searchTerm={searchTerm}
      setSearchTerm={doNothing}
      page={page}
    >
      {children}
    </AppealsProvider>
  );
};
