import React, { Dispatch, SetStateAction } from 'react';

export type OrganizationsContextType = {
  selectedOrganizationId: string;
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  clearFilters: () => void;
};
export const OrganizationsContext =
  React.createContext<OrganizationsContextType | null>(null);

interface OrganizationsContextProviderProps {
  children: React.ReactNode;
  selectedOrganizationId: string;
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  clearFilters: () => void;
}
export const OrganizationsContextProvider: React.FC<
  OrganizationsContextProviderProps
> = ({ children, selectedOrganizationId, search, setSearch, clearFilters }) => {
  return (
    <OrganizationsContext.Provider
      value={{ selectedOrganizationId, search, setSearch, clearFilters }}
    >
      {children}
    </OrganizationsContext.Provider>
  );
};
