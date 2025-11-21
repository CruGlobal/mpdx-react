import React, { createContext, useCallback, useMemo, useState } from 'react';
import {
  SectionOrderItem,
  sectionOrder,
} from '../AdditionalSalaryRequestHelper';

export type AdditionalSalaryRequestType = {
  selectedSection: SectionOrderItem;
  handleContinue: () => void;
  setSelectedSection: (section: SectionOrderItem) => void;
  isDrawerOpen: boolean;
  toggleDrawer: () => void;
  setIsDrawerOpen: (open: boolean) => void;
};

const AdditionalSalaryRequestContext =
  createContext<AdditionalSalaryRequestType | null>(null);

export const useAdditionalSalaryRequest = (): AdditionalSalaryRequestType => {
  const context = React.useContext(AdditionalSalaryRequestContext);
  if (context === null) {
    throw new Error(
      'Could not find AdditionalSalaryRequestContext. Make sure that your component is inside <AdditionalSalaryRequestProvider>.',
    );
  }
  return context;
};

interface Props {
  children?: React.ReactNode;
}

export const AdditionalSalaryRequestProvider: React.FC<Props> = ({
  children,
}) => {
  const [selectedSection, setSelectedSection] = useState(sectionOrder[0]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen((prev) => !prev);
  }, []);

  const handleContinue = useCallback(() => {
    const currentIndex = sectionOrder.findIndex(
      (item) => item === selectedSection,
    );
    if (currentIndex !== -1 && currentIndex < sectionOrder.length - 1) {
      setSelectedSection(sectionOrder[currentIndex + 1]);
    }
  }, [selectedSection]);

  const contextValue = useMemo(
    () => ({
      selectedSection,
      handleContinue,
      setSelectedSection,
      isDrawerOpen,
      toggleDrawer,
      setIsDrawerOpen,
    }),
    [
      selectedSection,
      handleContinue,
      setSelectedSection,
      isDrawerOpen,
      toggleDrawer,
    ],
  );

  return (
    <AdditionalSalaryRequestContext.Provider value={contextValue}>
      {children}
    </AdditionalSalaryRequestContext.Provider>
  );
};
