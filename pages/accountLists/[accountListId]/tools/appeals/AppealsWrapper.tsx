import { useRouter } from 'next/router';
import React, { useMemo, useState } from 'react';
import {
  AppealTourEnum,
  AppealsProvider,
  TableViewModeEnum,
} from 'src/components/Tool/Appeal/AppealsContext/AppealsContext';
import { ContactPanelProvider } from 'src/components/common/ContactPanelProvider/ContactPanelProvider';
import { UrlFiltersProvider } from 'src/components/common/UrlFiltersProvider/UrlFiltersProvider';

interface Props {
  children?: React.ReactNode;
}

export const AppealsWrapper: React.FC<Props> = ({ children }) => {
  const router = useRouter();
  const { query } = router;

  const [filterPanelOpen, setFilterPanelOpen] = useState<boolean>(false);

  const appealIdParams = Array.isArray(query.appealId) ? query.appealId : [];
  const appealId = appealIdParams[0];

  // TODO: Pull the default value from preferences
  const [viewMode, setViewMode] = useState(
    appealIdParams[1] === 'list'
      ? TableViewModeEnum.List
      : TableViewModeEnum.Flows,
  );
  const [tour, setTour] = useState<AppealTourEnum | null>(
    appealIdParams[2] === 'tour' ? AppealTourEnum.Start : null,
  );

  const appealIdPrefix = useMemo(() => {
    const appealIdPrefix = [appealId, viewMode];
    return viewMode === TableViewModeEnum.List && tour
      ? [...appealIdPrefix, 'tour']
      : appealIdPrefix;
  }, [appealId, viewMode, tour]);

  return (
    <ContactPanelProvider
      contactIdParam="appealId"
      contactIdPrefix={appealIdPrefix}
    >
      <UrlFiltersProvider>
        <AppealsProvider
          filterPanelOpen={filterPanelOpen}
          setFilterPanelOpen={setFilterPanelOpen}
          appealId={appealId}
          viewMode={viewMode}
          setViewMode={setViewMode}
          tour={tour}
          setTour={setTour}
          userOptionsLoading={false}
        >
          {children}
        </AppealsProvider>
      </UrlFiltersProvider>
    </ContactPanelProvider>
  );
};
