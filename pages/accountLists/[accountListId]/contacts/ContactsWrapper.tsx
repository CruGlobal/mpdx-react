import { ParsedUrlQuery } from 'node:querystring';
import { useRouter } from 'next/router';
import React, { SetStateAction, useCallback, useMemo } from 'react';
import { omit } from 'lodash';
import { ContactsProvider } from 'src/components/Contacts/ContactsContext/ContactsContext';
import { ContactPanelProvider } from 'src/components/Shared/ContactPanelProvider/ContactPanelProvider';
import { TableViewModeEnum } from 'src/components/Shared/Header/ListHeader';
import { UrlFiltersProvider } from 'src/components/Shared/UrlFiltersProvider/UrlFiltersProvider';
import { useOfflineMode } from 'src/hooks/useOfflineMode';
import { useUserPreference } from 'src/hooks/useUserPreference';

// Extract the initial view mode from the URL
const getQueryViewMode = (query: ParsedUrlQuery): TableViewModeEnum => {
  if (Array.isArray(query.contactId)) {
    const viewMode = query.contactId[0] as TableViewModeEnum;
    if (Object.values(TableViewModeEnum).includes(viewMode)) {
      return viewMode;
    }
  }

  return TableViewModeEnum.List;
};

interface Props {
  children?: React.ReactNode;
}

export const ContactsWrapper: React.FC<Props> = ({ children }) => {
  const router = useRouter();
  const { query } = router;

  const offlineMode = useOfflineMode();

  const [
    preferredViewMode,
    setPreferredViewMode,
    { loading: userOptionsLoading },
  ] = useUserPreference({
    key: 'contacts_view',
    defaultValue: getQueryViewMode(query),
  });
  // Offline mode only supports the list, but the saved preference stays untouched
  const viewMode = offlineMode ? TableViewModeEnum.List : preferredViewMode;

  const setViewMode = useCallback(
    (newViewModeArg: SetStateAction<TableViewModeEnum>) => {
      const newViewMode =
        typeof newViewModeArg === 'function'
          ? newViewModeArg(viewMode)
          : newViewModeArg;
      if (offlineMode && newViewMode !== TableViewModeEnum.List) {
        router.replace(
          { pathname: router.pathname, query: omit(query, 'offline') },
          undefined,
          { shallow: true },
        );
      }
      setPreferredViewMode(newViewMode);
    },
    [offlineMode, viewMode, query, setPreferredViewMode],
  );

  const [filterPanelOpen, setFilterPanelOpen] = useUserPreference({
    key: 'contact_filters_collapse',
    defaultValue: false,
  });

  const contactIdPrefix = useMemo(
    () => (viewMode === TableViewModeEnum.List ? [] : [viewMode]),
    [viewMode],
  );

  return (
    <ContactPanelProvider contactIdPrefix={contactIdPrefix}>
      <UrlFiltersProvider offlineMode={offlineMode}>
        <ContactsProvider
          filterPanelOpen={filterPanelOpen}
          setFilterPanelOpen={setFilterPanelOpen}
          viewMode={viewMode}
          setViewMode={setViewMode}
          userOptionsLoading={userOptionsLoading}
        >
          {children}
        </ContactsProvider>
      </UrlFiltersProvider>
    </ContactPanelProvider>
  );
};
