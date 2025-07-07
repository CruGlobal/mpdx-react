import { useRouter } from 'next/router';
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useGetUserOptionsLazyQuery } from 'src/components/Contacts/ContactFlow/GetUserOptions.generated';
import {
  AppealTourEnum,
  AppealsProvider,
  TableViewModeEnum,
} from 'src/components/Tool/Appeal/AppealsContext/AppealsContext';
import { ContactPanelProvider } from 'src/components/common/ContactPanelProvider/ContactPanelProvider';
import { UrlFiltersProvider } from 'src/components/common/UrlFiltersProvider/UrlFiltersProvider';

/**
 * Extract the view mode from a string.
 */
const parseViewMode = (
  viewMode: string | null | undefined,
): TableViewModeEnum | null => {
  if (typeof viewMode !== 'string') {
    return null;
  }

  if (viewMode === TableViewModeEnum.List) {
    return TableViewModeEnum.List;
  }
  // Default to flows if the view mode value is invalid
  return TableViewModeEnum.Flows;
};

interface Props {
  children?: React.ReactNode;
}

export const AppealsWrapper: React.FC<Props> = ({ children }) => {
  const router = useRouter();
  const { query } = router;

  const [filterPanelOpen, setFilterPanelOpen] = useState<boolean>(false);

  const appealIdParams = Array.isArray(query.appealId) ? query.appealId : [];
  const appealId = appealIdParams[0];

  const [viewMode, setViewMode] = useState(parseViewMode(appealIdParams[1]));
  const [tour, setTour] = useState<AppealTourEnum | null>(
    appealIdParams[2] === 'tour' ? AppealTourEnum.Start : null,
  );

  // Load the initial view mode from preferences if it was not explicitly provided
  const [loadUserOptions] = useGetUserOptionsLazyQuery();
  useEffect(() => {
    if (viewMode === null) {
      loadUserOptions().then(({ data }) => {
        if (!data) {
          return;
        }

        const defaultView = parseViewMode(
          data.userOptions.find((option) => option.key === 'contacts_view')
            ?.value,
        );
        if (defaultView) {
          setViewMode(defaultView);
        }
      });
    }
  }, [viewMode]);

  const appealIdPrefix = useMemo(() => {
    const appealIdPrefix = [appealId];
    if (viewMode !== null) {
      appealIdPrefix.push(viewMode);
    }
    if (viewMode === TableViewModeEnum.List && tour) {
      appealIdPrefix.push('tour');
    }
    return appealIdPrefix;
  }, [appealId, viewMode, tour]);

  return (
    <ContactPanelProvider
      contactIdParam="appealId"
      contactIdPrefix={appealIdPrefix}
      prefixMinLength={1}
    >
      <UrlFiltersProvider>
        <AppealsProvider
          filterPanelOpen={filterPanelOpen}
          setFilterPanelOpen={setFilterPanelOpen}
          appealId={appealId}
          viewMode={viewMode}
          setViewMode={
            setViewMode as Dispatch<SetStateAction<TableViewModeEnum>>
          }
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
