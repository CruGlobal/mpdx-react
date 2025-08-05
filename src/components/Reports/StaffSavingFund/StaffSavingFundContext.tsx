import React, { useCallback, useMemo, useState } from 'react';
import { useAccountListId } from 'src/hooks/useAccountListId';

export type StaffSavingFundType = {
  accountListId?: string;
  isNavListOpen: boolean;
  onNavListToggle: () => void;
};

// Context for passing layout props to children
export const StaffSavingFundContext =
  React.createContext<StaffSavingFundType | null>(null);

interface Props {
  children?: React.ReactNode;
}

export const StaffSavingFundProvider: React.FC<Props> = ({ children }) => {
  const accountListId = useAccountListId();
  const [isNavListOpen, setIsNavListOpen] = useState(false);

  const onNavListToggle = useCallback(() => {
    setIsNavListOpen(!isNavListOpen);
  }, [isNavListOpen]);

  const contextValue = useMemo(
    () => ({
      accountListId,
      isNavListOpen,
      onNavListToggle,
    }),
    [accountListId, isNavListOpen, onNavListToggle],
  );

  return (
    <StaffSavingFundContext.Provider value={contextValue}>
      {children}
    </StaffSavingFundContext.Provider>
  );
};
