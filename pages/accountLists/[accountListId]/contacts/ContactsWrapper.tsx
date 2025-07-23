import { ParsedUrlQuery } from 'node:querystring';
import { useRouter } from 'next/router';
import React, { useMemo } from 'react';
import { ContactsProvider } from 'src/components/Contacts/ContactsContext/ContactsContext';
import { TableViewModeEnum } from 'src/components/Shared/Header/ListHeader';
import { ContactPanelProvider } from 'src/components/common/ContactPanelProvider/ContactPanelProvider';
import { UrlFiltersProvider } from 'src/components/common/UrlFiltersProvider/UrlFiltersProvider';
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

  const [viewMode, setViewMode, { loading: userOptionsLoading }] =
    useUserPreference({
      key: 'contacts_view',
      defaultValue: getQueryViewMode(query),
    });

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
