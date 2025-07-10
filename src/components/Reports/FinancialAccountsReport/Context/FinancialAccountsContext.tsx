import { ParsedUrlQueryInput } from 'querystring';
import React, { Dispatch, SetStateAction, useState } from 'react';
import { FinancialAccountTransactionFilters } from 'pages/accountLists/[accountListId]/reports/financialAccounts/[financialAccountId]/Wrapper';
import { Panel } from 'pages/accountLists/[accountListId]/reports/helpers';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useFinancialAccountQuery } from './FinancialAccount.generated';

interface SetFinancialAccountProps {
  id?: string;
  viewTransactions?: boolean;
  transactionFilters?: ParsedUrlQueryInput;
}

export type SetFinancialAccountFunction = ({
  id,
  viewTransactions,
  transactionFilters,
}: SetFinancialAccountProps) => void;

export interface FinancialAccountType {
  accountListId: string;
  financialAccountId: string | undefined;
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  financialAccountQuery: ReturnType<typeof useFinancialAccountQuery>;
  activeFilters: FinancialAccountTransactionFilters;
  hasActiveFilters: boolean;
  setActiveFilters: Dispatch<
    SetStateAction<FinancialAccountTransactionFilters>
  >;
  urlFilters: any;
  isNavListOpen: boolean;
  designationAccounts: string[];
  setDesignationAccounts: Dispatch<SetStateAction<string[]>>;
  panelOpen: Panel | null;
  setPanelOpen: Dispatch<SetStateAction<Panel | null>>;
  handleNavListToggle: () => void;
  handleFilterListToggle: () => void;
}

export const FinancialAccountContext =
  React.createContext<FinancialAccountType | null>(null);

interface FinancialAccountProviderProps {
  children?: React.ReactNode;
  urlFilters?: any;
  activeFilters: FinancialAccountTransactionFilters;
  setActiveFilters: Dispatch<
    SetStateAction<FinancialAccountTransactionFilters>
  >;
  financialAccountId: string | undefined;
  search: string | string[] | undefined;
}

export const FinancialAccountProvider: React.FC<
  FinancialAccountProviderProps
> = ({
  children,
  urlFilters,
  activeFilters,
  setActiveFilters,
  financialAccountId,
  search,
}) => {
  const accountListId = useAccountListId() ?? '';

  const [designationAccounts, setDesignationAccounts] = useState<string[]>([]);
  const [panelOpen, setPanelOpen] = useState<Panel | null>(null);
  const [searchTerm, setSearchTerm] = useState(
    typeof search === 'string' ? search : '',
  );

  const handleNavListToggle = () => {
    setPanelOpen(panelOpen === Panel.Navigation ? null : Panel.Navigation);
  };

  const handleFilterListToggle = () => {
    setPanelOpen(panelOpen === Panel.Filters ? null : Panel.Filters);
  };

  const financialAccountQuery = useFinancialAccountQuery({
    variables: {
      accountListId,
      financialAccountId: financialAccountId ?? '',
    },
    skip: !financialAccountId,
  });

  const hasActiveFilters = !!Object.keys(activeFilters).length;
  const isNavListOpen = !!panelOpen;

  return (
    <FinancialAccountContext.Provider
      value={{
        accountListId: accountListId ?? '',
        financialAccountId,
        financialAccountQuery,
        searchTerm,
        setSearchTerm,
        activeFilters,
        hasActiveFilters,
        setActiveFilters,
        urlFilters,
        isNavListOpen,
        designationAccounts,
        setDesignationAccounts,
        handleNavListToggle,
        handleFilterListToggle,
        panelOpen,
        setPanelOpen,
      }}
    >
      {children}
    </FinancialAccountContext.Provider>
  );
};
