import React, { createContext, useCallback, useMemo, useState } from 'react';
import {
  AdditionalSalaryRequestSectionEnum,
  SectionOrderItem,
} from '../AdditionalSalaryRequestHelper';

export type AdditionalSalaryRequestType = {
  sectionOrder: SectionOrderItem[];
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
  // Translated titles should be used when rendering
  const sectionOrder = useMemo<SectionOrderItem[]>(
    () => [
      {
        title: 'About this Form',
        section: AdditionalSalaryRequestSectionEnum.AboutForm,
      },
      {
        title: 'Complete Form',
        section: AdditionalSalaryRequestSectionEnum.CompleteForm,
      },
      {
        title: 'Receipt',
        section: AdditionalSalaryRequestSectionEnum.Receipt,
      },
    ],
    [],
  );

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
  }, [sectionOrder, selectedSection]);

  const contextValue = useMemo<AdditionalSalaryRequestType>(
    () => ({
      sectionOrder,
      selectedSection,
      handleContinue,
      setSelectedSection,
      isDrawerOpen,
      toggleDrawer,
      setIsDrawerOpen,
    }),
    [
      sectionOrder,
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
