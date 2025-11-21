import React, { createContext, useCallback, useMemo, useState } from 'react';
import { useStepList } from 'src/hooks/useStepList';
import { FormEnum } from '../../Shared/CalculationReports/Shared/sharedTypes';
import { Steps } from '../../Shared/CalculationReports/StepsList/StepsList';
import { AdditionalSalaryRequestSectionEnum } from '../AdditionalSalaryRequestHelper';

export type AdditionalSalaryRequestType = {
  steps: Steps[];

  selectedSection: AdditionalSalaryRequestSectionEnum;
  setSelectedSection: (section: AdditionalSalaryRequestSectionEnum) => void;
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
  const steps = useStepList(FormEnum.AdditionalSalary);

  const [selectedSection, setSelectedSectionState] =
    useState<AdditionalSalaryRequestSectionEnum>(
      AdditionalSalaryRequestSectionEnum.AboutForm,
    );
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  const setSelectedSection = useCallback(
    (section: AdditionalSalaryRequestSectionEnum) => {
      setSelectedSectionState(section);
      if (section === AdditionalSalaryRequestSectionEnum.AboutForm) {
        setIsDrawerOpen(true);
      }
    },
    [],
  );

  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen((prev) => !prev);
  }, []);

  const contextValue = useMemo(
    () => ({
      steps,
      selectedSection,
      setSelectedSection,
      isDrawerOpen,
      toggleDrawer,
      setIsDrawerOpen,
    }),
    [steps, selectedSection, setSelectedSection, isDrawerOpen, toggleDrawer],
  );

  return (
    <AdditionalSalaryRequestContext.Provider value={contextValue}>
      {children}
    </AdditionalSalaryRequestContext.Provider>
  );
};
