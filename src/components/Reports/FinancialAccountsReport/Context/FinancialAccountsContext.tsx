import { ParsedUrlQueryInput } from 'querystring';
import { useRouter } from 'next/router';
import React, { Dispatch, SetStateAction, useState } from 'react';
import {
  FinancialAccountPageEnum,
  FinancialAccountTransactionFilters,
} from 'pages/accountLists/[accountListId]/reports/financialAccounts/Wrapper';
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
  financialAccountsQuery: ReturnType<typeof useFinancialAccountQuery>;
  setFinancialAccount: SetFinancialAccountFunction;
  activeFilters: FinancialAccountTransactionFilters;
  hasActiveFilters: boolean;
  setActiveFilters: Dispatch<
    SetStateAction<FinancialAccountTransactionFilters>
  >;
  urlFilters: any;
  page: FinancialAccountPageEnum | undefined;
  setPage: Dispatch<SetStateAction<FinancialAccountPageEnum>>;
  isNavListOpen: boolean;
  designationAccounts: string[];
  setDesignationAccounts: Dispatch<SetStateAction<string[]>>;
  panelOpen: Panel | null;
  setPanelOpen: Dispatch<SetStateAction<Panel | null>>;
  handleNavListToggle: () => void;
  handleFilterListToggle: () => void;
  handleClearAll: () => void;
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
  page: FinancialAccountPageEnum;
  setPage: Dispatch<SetStateAction<FinancialAccountPageEnum>>;
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
  page,
  setPage,
}) => {
  const accountListId = useAccountListId() ?? '';
  const router = useRouter();
  const { push } = router;

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

  const handleClearAll = () => {
    setSearchTerm('');
  };

  const financialAccountsQuery = useFinancialAccountQuery({
    variables: {
      accountListId,
      financialAccountId: financialAccountId ?? '',
    },
    skip: !financialAccountId,
  });

  const setFinancialAccount: SetFinancialAccountFunction = ({
    id,
    viewTransactions,
    transactionFilters,
  }: SetFinancialAccountProps) => {
    let pathname = '';
    pathname = `/accountLists/${accountListId}/reports/financialAccounts`;

    if (id) {
      pathname += `/${id}`;
      if (viewTransactions) {
        pathname += `/entries`;
      }
    }

    push({
      pathname,
      query: transactionFilters ?? {},
    });
  };

  const hasActiveFilters = !!Object.keys(activeFilters).length;
  const isNavListOpen = !!panelOpen;

  return (
    <FinancialAccountContext.Provider
      value={{
        accountListId: accountListId ?? '',
        financialAccountId,
        financialAccountsQuery,
        searchTerm,
        setSearchTerm,
        setFinancialAccount,
        activeFilters,
        hasActiveFilters,
        setActiveFilters,
        urlFilters,
        page,
        setPage,
        isNavListOpen,
        designationAccounts,
        setDesignationAccounts,
        handleNavListToggle,
        handleFilterListToggle,
        panelOpen,
        setPanelOpen,
        handleClearAll,
      }}
    >
      {children}
    </FinancialAccountContext.Provider>
  );
};
