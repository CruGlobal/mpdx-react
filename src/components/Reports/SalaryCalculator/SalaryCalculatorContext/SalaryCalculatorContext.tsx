import React, {
  Dispatch,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import {
  SalaryCalculatorSectionEnum,
  useSectionSteps,
} from '../useSectionSteps';
import { HcmQuery, useHcmQuery } from './Hcm.generated';
import {
  SalaryCalculationQuery,
  useSalaryCalculationQuery,
} from './SalaryCalculation.generated';

export interface SalaryCalculatorStep {
  key: SalaryCalculatorSectionEnum;
  label: string;
}

export interface SalaryCalculatorContextType {
  sectionSteps: SalaryCalculatorStep[];
  selectedSection: SalaryCalculatorSectionEnum;
  setSelectedSection: Dispatch<SetStateAction<SalaryCalculatorSectionEnum>>;
  isDrawerOpen: boolean;
  setDrawerOpen: Dispatch<SetStateAction<boolean>>;
  toggleDrawer: () => void;
  stepStatus: { key: string; currentStep: boolean }[];

  hcm: HcmQuery['hcm'] | null;
  calculation: SalaryCalculationQuery['salaryRequest'] | null;
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
  const sectionSteps = useSectionSteps();
  const [selectedSection, setSelectedSection] =
    useState<SalaryCalculatorSectionEnum>(sectionSteps[0].key);
  const [isDrawerOpen, setDrawerOpen] = useState(true);
  const { data: hcmData } = useHcmQuery();
  const { data: calculationData } = useSalaryCalculationQuery();

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

  const contextValue: SalaryCalculatorContextType = useMemo(
    () => ({
      sectionSteps,
      selectedSection,
      setSelectedSection,
      isDrawerOpen,
      setDrawerOpen,
      toggleDrawer,
      stepStatus,
      hcm: hcmData?.hcm ?? null,
      calculation: calculationData?.salaryRequest ?? null,
    }),
    [
      sectionSteps,
      selectedSection,
      isDrawerOpen,
      toggleDrawer,
      stepStatus,
      hcmData,
      calculationData,
    ],
  );

  return (
    <SalaryCalculatorContext.Provider value={contextValue}>
      {children}
    </SalaryCalculatorContext.Provider>
  );
};
