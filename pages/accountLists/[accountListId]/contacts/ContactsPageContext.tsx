import React from 'react';
import { TableViewModeEnum } from 'src/components/Shared/Header/ListHeader';

export type ContactsPageType = {
  filterPanelOpen: boolean;
  setFilterPanelOpen: (open: boolean) => void;
  contactDetailsOpen: boolean;
  setContactDetailsOpen: (open: boolean) => void;
  contactDetailsId: string;
  setContactDetailsId: (id: string) => void;
  viewMode: TableViewModeEnum;
  setViewMode: (mode: TableViewModeEnum) => void;
};
export const ContactsPageContext = React.createContext<ContactsPageType | null>(
  null,
);

export const ContactsPageProvider: React.FC<React.ReactNode> = ({
  children,
}) => {
  const [contactDetailsOpen, setContactDetailsOpen] = React.useState(false);
  const [contactDetailsId, setContactDetailsId] = React.useState('');
  const [viewMode, setViewMode] = React.useState(TableViewModeEnum.List);
  const [filterPanelOpen, setFilterPanelOpen] = React.useState(false);
  return (
    <ContactsPageContext.Provider
      value={{
        filterPanelOpen,
        setFilterPanelOpen,
        contactDetailsOpen,
        setContactDetailsOpen,
        contactDetailsId,
        setContactDetailsId,
        viewMode,
        setViewMode,
      }}
    >
      {children}
    </ContactsPageContext.Provider>
  );
};
