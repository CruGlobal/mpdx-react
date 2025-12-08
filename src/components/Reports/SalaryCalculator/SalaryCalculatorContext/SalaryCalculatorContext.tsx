import React, {
  Dispatch,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useStepList } from 'src/hooks/useStepList';
import { FormEnum } from '../../Shared/CalculationReports/Shared/sharedTypes';
import { Steps } from '../../Shared/CalculationReports/StepsList/StepsList';
import { HcmQuery, useHcmQuery } from './Hcm.generated';
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

  handleNextStep: () => void;
  handlePreviousStep: () => void;

  isDrawerOpen: boolean;
  setDrawerOpen: Dispatch<SetStateAction<boolean>>;
  toggleDrawer: () => void;

  hcm: HcmQuery['hcm'] | null;
  hcmUser: HcmQuery['hcm'][number] | null;
  hcmSpouse: HcmQuery['hcm'][number] | null;
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
  const {
    steps,
    nextStep,
    previousStep,
    currentIndex,
    percentComplete,
    isLoading,
  } = useStepList(FormEnum.SalaryCalc);

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
      handleNextStep: nextStep,
      handlePreviousStep: previousStep,
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
      nextStep,
      previousStep,
      isDrawerOpen,
      toggleDrawer,
      hcmData,
      calculationData,
    ],
  );

  if (isLoading || !calculationData) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100%"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <SalaryCalculatorContext.Provider value={contextValue}>
      {children}
    </SalaryCalculatorContext.Provider>
  );
};
