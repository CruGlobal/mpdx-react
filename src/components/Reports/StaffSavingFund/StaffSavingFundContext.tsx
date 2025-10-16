import React, { useCallback, useMemo, useState } from 'react';

export type StaffSavingFundType = {
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
  const [isNavListOpen, setIsNavListOpen] = useState(false);

  const onNavListToggle = useCallback(() => {
    setIsNavListOpen(!isNavListOpen);
  }, [isNavListOpen]);

  const contextValue = useMemo(
    () => ({
      isNavListOpen,
      onNavListToggle,
    }),
    [isNavListOpen, onNavListToggle],
  );

  return (
    <StaffSavingFundContext.Provider value={contextValue}>
      {children}
    </StaffSavingFundContext.Provider>
  );
};
