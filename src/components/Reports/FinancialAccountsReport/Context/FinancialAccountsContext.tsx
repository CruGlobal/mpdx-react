import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { Panel } from 'pages/accountLists/[accountListId]/reports/helpers';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useFinancialAccountQuery } from './FinancialAccount.generated';

export interface FinancialAccountType {
  accountListId: string;
  financialAccountId: string | undefined;
  financialAccountQuery: ReturnType<typeof useFinancialAccountQuery>;
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
  financialAccountId: string | undefined;
}

export const FinancialAccountProvider: React.FC<
  FinancialAccountProviderProps
> = ({ children, financialAccountId }) => {
  const accountListId = useAccountListId() ?? '';

  const [designationAccounts, setDesignationAccounts] = useState<string[]>([]);
  const [panelOpen, setPanelOpen] = useState<Panel | null>(null);

  const handleNavListToggle = useCallback(() => {
    setPanelOpen(panelOpen === Panel.Navigation ? null : Panel.Navigation);
  }, [panelOpen]);

  const handleFilterListToggle = useCallback(() => {
    setPanelOpen(panelOpen === Panel.Filters ? null : Panel.Filters);
  }, [panelOpen]);

  const financialAccountQuery = useFinancialAccountQuery({
    variables: {
      accountListId,
      financialAccountId: financialAccountId ?? '',
    },
    skip: !financialAccountId,
  });

  const isNavListOpen = !!panelOpen;

  const contextValue = useMemo(
    () => ({
      accountListId: accountListId ?? '',
      financialAccountId,
      financialAccountQuery,
      isNavListOpen,
      designationAccounts,
      setDesignationAccounts,
      handleNavListToggle,
      handleFilterListToggle,
      panelOpen,
      setPanelOpen,
    }),
    [
      accountListId,
      financialAccountId,
      financialAccountQuery,
      isNavListOpen,
      designationAccounts,
      handleNavListToggle,
      handleFilterListToggle,
      panelOpen,
      setPanelOpen,
    ],
  );

  return (
    <FinancialAccountContext.Provider value={contextValue}>
      {children}
    </FinancialAccountContext.Provider>
  );
};
