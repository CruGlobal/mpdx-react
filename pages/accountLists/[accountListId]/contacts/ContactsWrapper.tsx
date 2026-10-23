import { ParsedUrlQuery } from 'node:querystring';
import { useRouter } from 'next/router';
import React, { useMemo } from 'react';
import { ContactsProvider } from 'src/components/Contacts/ContactsContext/ContactsContext';
import { ContactPanelProvider } from 'src/components/Shared/ContactPanelProvider/ContactPanelProvider';
import { TableViewModeEnum } from 'src/components/Shared/Header/ListHeader';
import { UrlFiltersProvider } from 'src/components/Shared/UrlFiltersProvider/UrlFiltersProvider';
import { useFilterPanelOpen } from 'src/hooks/useFilterPanelOpen';
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
  const { query } = useRouter();

  const offlineMode = useOfflineMode();

  const [preferredViewMode, setViewMode, { loading: userOptionsLoading }] =
    useUserPreference({
      key: 'contacts_view',
      defaultValue: getQueryViewMode(query),
    });
  // Offline mode only supports the list, but the saved preference stays untouched
  const viewMode = offlineMode ? TableViewModeEnum.List : preferredViewMode;

  const [filterPanelOpen, setFilterPanelOpen] = useFilterPanelOpen(
    'contact_filters_collapse',
  );

  const contactIdPrefix = useMemo(
    () => (viewMode === TableViewModeEnum.List ? [] : [viewMode]),
    [viewMode],
  );

  return (
    <ContactPanelProvider contactIdPrefix={contactIdPrefix}>
      <UrlFiltersProvider>
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
