import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import {
  AppealsProvider,
  TableViewModeEnum,
} from 'src/components/Tool/Appeal/AppealsContext/AppealsContext';
import { UrlFiltersProvider } from 'src/components/common/UrlFiltersProvider/UrlFiltersProvider';

interface Props {
  children?: React.ReactNode;
}

export enum PageEnum {
  DetailsPage = 'DetailsPage',
  ContactsPage = 'ContactsPage',
}

export const AppealsWrapper: React.FC<Props> = ({ children }) => {
  const router = useRouter();
  const { query, push } = router;

  const [filterPanelOpen, setFilterPanelOpen] = useState<boolean>(false);
  const [page, setPage] = useState<PageEnum>();
  const [appealId, setAppealId] = useState<string | undefined>(undefined);
  const [contactId, setContactId] = useState<string | string[] | undefined>(
    undefined,
  );

  const { appealId: appealIdParams, accountListId } = query;

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

  const doNothing = () => {};

  return (
    <UrlFiltersProvider>
      <AppealsProvider
        filterPanelOpen={filterPanelOpen}
        setFilterPanelOpen={setFilterPanelOpen}
        appealId={appealId}
        contactId={contactId}
        page={page}
        viewMode={TableViewModeEnum.List}
        setViewMode={doNothing}
      >
        {children}
      </AppealsProvider>
    </UrlFiltersProvider>
  );
};
