import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { ContactsProvider } from 'src/components/Contacts/ContactsContext/ContactsContext';
import { TableViewModeEnum } from 'src/components/Shared/Header/ListHeader';
import { UrlFiltersProvider } from 'src/components/common/UrlFiltersProvider/UrlFiltersProvider';
import { useUserPreference } from 'src/hooks/useUserPreference';

interface Props {
  children?: React.ReactNode;
}

export const ContactsWrapper: React.FC<Props> = ({ children }) => {
  const router = useRouter();
  const { pathname, query, replace } = router;

  // Extract the initial view mode from the URL
  const [viewMode, setViewMode] = useState(() => {
    const viewMode = query.contactId?.[0];
    if (
      viewMode &&
      (Object.values(TableViewModeEnum) as string[]).includes(viewMode)
    ) {
      return viewMode as TableViewModeEnum;
    } else {
      return TableViewModeEnum.List;
    }
  });

  // Add the view mode to the URL
  useEffect(() => {
    replace(
      {
        pathname,
        query: {
          ...query,
          contactId: viewMode === TableViewModeEnum.List ? [] : [viewMode],
        },
      },
      undefined,
      { shallow: true },
    );
  }, [viewMode]);

  const [filterPanelOpen, setFilterPanelOpen] = useUserPreference({
    key: 'contact_filters_collapse',
    defaultValue: false,
  });

  return (
    <UrlFiltersProvider>
      <ContactsProvider
        filterPanelOpen={filterPanelOpen}
        setFilterPanelOpen={setFilterPanelOpen}
        viewMode={viewMode}
        setViewMode={setViewMode}
      >
        {children}
      </ContactsProvider>
    </UrlFiltersProvider>
  );
};
