import React, { Dispatch, SetStateAction } from 'react';

export type OrganizationsContextType = {
  selectedOrganizationId: string;
  selectedOrganizationName: string;
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  clearFilters: () => void;
};
export const OrganizationsContext =
  React.createContext<OrganizationsContextType | null>(null);

interface OrganizationsContextProviderProps {
  children: React.ReactNode;
  selectedOrganizationId: string;
  selectedOrganizationName: string;
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  clearFilters: () => void;
}
export const OrganizationsContextProvider: React.FC<
  OrganizationsContextProviderProps
> = ({
  children,
  selectedOrganizationId,
  selectedOrganizationName,
  search,
  setSearch,
  clearFilters,
}) => {
  return (
    <OrganizationsContext.Provider
      value={{
        selectedOrganizationId,
        selectedOrganizationName,
        search,
        setSearch,
        clearFilters,
      }}
    >
      {children}
    </OrganizationsContext.Provider>
  );
};
