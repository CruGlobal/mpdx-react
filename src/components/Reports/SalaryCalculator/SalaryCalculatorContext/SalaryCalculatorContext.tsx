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
import { HcmQuery, useHcmQuery } from './Hcm.generated';
import { nextStep, previousStep } from './Helper/StepsRecord';
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
  const steps = useStepList(FormEnum.SalaryCalc);
  const totalSteps = steps.length;

  // Step Handlers
  const [currentStep, setCurrentStep] = useState(
    SalaryCalculatorSectionEnum.EffectiveDate,
  );
  const [percentComplete, setPercentComplete] = useState(20);

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNextStep = () => {
    setCurrentStep((prevStep) => {
      const next = nextStep[prevStep];

      const newIndex = currentIndex + 1;
      handleNextIndexChange(newIndex);
      handlePercentComplete(newIndex);
      return next;
    });
  };

  const handlePreviousStep = () => {
    setCurrentStep((prevStep) => {
      const next = previousStep[prevStep];

      const newIndex = currentIndex - 1;
      handlePreviousIndexChange(newIndex);
      handlePercentComplete(newIndex);
      return next;
    });
  };

  const handlePercentComplete = (index: number) => {
    const newPercent = Math.round(((index + 1) / totalSteps) * 100);
    setPercentComplete(newPercent);
  };

  const handleNextIndexChange = (newIndex: number) => {
    steps[currentIndex].current = false;
    steps[currentIndex].complete = true;
    setCurrentIndex(newIndex);
    steps[newIndex].current = true;

    if (newIndex === steps.length - 1) {
      steps[newIndex].complete = true;
    }
  };

  const handlePreviousIndexChange = (newIndex: number) => {
    steps[currentIndex].current = false;
    steps[newIndex].complete = false;
    setCurrentIndex(newIndex);
    steps[newIndex].current = true;
  };
  // End Step Handlers

  const [isDrawerOpen, setDrawerOpen] = useState(true);
  const { data: hcmData } = useHcmQuery();
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
