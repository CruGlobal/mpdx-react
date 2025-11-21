import React, {
  Dispatch,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { useStepList } from 'src/hooks/useStepList';
import { FormEnum } from '../../Shared/CalculationReports/Shared/sharedTypes';
import { Steps } from '../../Shared/CalculationReports/StepsList/StepsList';
import {
  SalaryCalculatorSectionEnum,
  useSectionSteps,
} from '../useSectionSteps';

export interface SalaryCalculatorStep {
  key: SalaryCalculatorSectionEnum;
  label: string;
}

export interface SalaryCalculatorContextType {
  steps: Steps[];

  sectionSteps: SalaryCalculatorStep[];
  selectedSection: SalaryCalculatorSectionEnum;
  setSelectedSection: Dispatch<SetStateAction<SalaryCalculatorSectionEnum>>;
  isDrawerOpen: boolean;
  setDrawerOpen: Dispatch<SetStateAction<boolean>>;
  toggleDrawer: () => void;
  stepStatus: { key: string; currentStep: boolean }[];
}

const SalaryCalculatorContext =
  createContext<SalaryCalculatorContextType | null>(null);

export const useSalaryCalculator = (): SalaryCalculatorContextType => {
  const context = useContext(SalaryCalculatorContext);
  if (!context) {
    throw new Error(
      'useSalaryCalculator must be used within a SalaryCalculatorProvider',
    );
  }
  return context;
};

interface SalaryCalculatorContextProps {
  children?: React.ReactNode;
}

export const SalaryCalculatorProvider: React.FC<
  SalaryCalculatorContextProps
> = ({ children }) => {
  const steps = useStepList(FormEnum.SalaryCalc);

  const sectionSteps = useSectionSteps();
  const [selectedSection, setSelectedSection] =
    useState<SalaryCalculatorSectionEnum>(sectionSteps[0].key);
  const [isDrawerOpen, setDrawerOpen] = useState(true);

  const toggleDrawer = useCallback(() => {
    setDrawerOpen((prev) => !prev);
  }, []);

  const stepStatus = useMemo(
    () =>
      sectionSteps.map((step) => ({
        key: step.key,
        currentStep: step.key === selectedSection,
      })),
    [sectionSteps, selectedSection],
  );

  const contextValue = useMemo(
    () => ({
      steps,
      sectionSteps,
      selectedSection,
      setSelectedSection,
      isDrawerOpen,
      setDrawerOpen,
      toggleDrawer,
      stepStatus,
    }),
    [
      steps,
      sectionSteps,
      selectedSection,
      isDrawerOpen,
      stepStatus,
      toggleDrawer,
    ],
  );

  return (
    <SalaryCalculatorContext.Provider value={contextValue}>
      {children}
    </SalaryCalculatorContext.Provider>
  );
};
