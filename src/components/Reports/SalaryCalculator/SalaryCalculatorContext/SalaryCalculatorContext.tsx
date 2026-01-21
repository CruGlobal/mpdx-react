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
  HcmDataQuery,
  useHcmDataQuery,
} from '../../Shared/HcmData/HCMData.generated';
import { SalaryCalculatorSectionEnum } from './Helper/sharedTypes';
import {
  SalaryCalculationQuery,
  useSalaryCalculationQuery,
} from './SalaryCalculation.generated';

export interface SalaryCalculatorStep {
  key: SalaryCalculatorSectionEnum;
  label: string;
}

export interface SalaryCalculatorContextType {
  steps: Steps[];
  currentIndex: number;
  percentComplete: number;

  currentStep: SalaryCalculatorSectionEnum;
  handleNextStep: () => void;
  handlePreviousStep: () => void;

  isDrawerOpen: boolean;
  setDrawerOpen: Dispatch<SetStateAction<boolean>>;
  toggleDrawer: () => void;

  hcm: HcmDataQuery['hcm'] | null;
  hcmUser: HcmDataQuery['hcm'][number] | null;
  hcmSpouse: HcmDataQuery['hcm'][number] | null;
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

const objects = Object.values(SalaryCalculatorSectionEnum);

export const SalaryCalculatorProvider: React.FC<
  SalaryCalculatorContextProps
> = ({ children }) => {
  const { steps, nextStep, previousStep, currentIndex, percentComplete } =
    useStepList(FormEnum.SalaryCalc);

  // Step Handlers
  const [currentStep, setCurrentStep] = useState(
    SalaryCalculatorSectionEnum.EffectiveDate,
  );

  const handleNextStep = useCallback(() => {
    const next = objects[currentIndex + 1];
    nextStep();

    setCurrentStep(next);
  }, [currentIndex, objects, nextStep]);

  const handlePreviousStep = useCallback(() => {
    const next = objects[currentIndex - 1];
    previousStep();

    setCurrentStep(next);
  }, [currentIndex, objects, previousStep]);
  // End Step Handlers

  const [isDrawerOpen, setDrawerOpen] = useState(true);
  const { data: hcmData } = useHcmDataQuery();
  const { data: calculationData } = useSalaryCalculationQuery();

  const toggleDrawer = useCallback(() => {
    setDrawerOpen((prev) => !prev);
  }, []);

  const contextValue: SalaryCalculatorContextType = useMemo(
    () => ({
      steps,
      currentIndex,
      percentComplete,
      currentStep,
      handleNextStep,
      handlePreviousStep,
      isDrawerOpen,
      setDrawerOpen,
      toggleDrawer,
      hcm: hcmData?.hcm ?? null,
      hcmUser: hcmData?.hcm[0] ?? null,
      hcmSpouse: hcmData?.hcm[1] ?? null,
      calculation: calculationData?.salaryRequest ?? null,
    }),
    [
      steps,
      currentIndex,
      percentComplete,
      currentStep,
      handleNextStep,
      handlePreviousStep,
      isDrawerOpen,
      toggleDrawer,
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
