import React, { createContext, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStepList } from 'src/hooks/useStepList';
import { FormEnum } from '../../Shared/CalculationReports/Shared/sharedTypes';
import { Steps } from '../../Shared/CalculationReports/StepsList/StepsList';
import {
  AdditionalSalaryRequestSectionEnum,
  SectionOrderItem,
} from '../AdditionalSalaryRequestHelper';

export type AdditionalSalaryRequestType = {
  steps: Steps[];

  sectionOrder: SectionOrderItem[];
  selectedSection: SectionOrderItem;
  handleContinue: () => void;
  setSectionIndex: (number) => void;
  isDrawerOpen: boolean;
  toggleDrawer: () => void;
  setIsDrawerOpen: (open: boolean) => void;
  handleCancel: () => void;
  handleBack: () => void;
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
  const steps = useStepList(FormEnum.AdditionalSalary);

  const { t } = useTranslation();
  // Translated titles should be used when rendering
  const sectionOrder = useMemo<SectionOrderItem[]>(
    () => [
      {
        title: t('About this Form'),
        section: AdditionalSalaryRequestSectionEnum.AboutForm,
      },
      {
        title: t('Complete Form'),
        section: AdditionalSalaryRequestSectionEnum.CompleteForm,
      },
      {
        title: t('Receipt'),
        section: AdditionalSalaryRequestSectionEnum.Receipt,
      },
    ],
    [t],
  );
  const [sectionIndex, setSectionIndex] = useState(0);
  const selectedSection = sectionOrder[sectionIndex];
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen((prev) => !prev);
  }, []);

  const handleContinue = useCallback(() => {
    if (sectionIndex < sectionOrder.length - 1) {
      setSectionIndex(sectionIndex + 1);
    }
  }, [sectionIndex, sectionOrder.length]);

  const handleCancel = useCallback(() => {
    setSectionIndex(0);
  }, []);

  const handleBack = useCallback(() => {
    if (sectionIndex > 0) {
      setSectionIndex(sectionIndex - 1);
    }
  }, [sectionIndex]);

  const contextValue = useMemo<AdditionalSalaryRequestType>(
    () => ({
      steps,
      sectionOrder,
      setSectionIndex,
      selectedSection,
      handleContinue,
      isDrawerOpen,
      toggleDrawer,
      setIsDrawerOpen,
      handleCancel,
      handleBack,
    }),
    [
      steps,
      sectionOrder,
      selectedSection,
      handleContinue,
      handleCancel,
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
