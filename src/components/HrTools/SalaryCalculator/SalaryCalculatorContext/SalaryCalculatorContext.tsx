import { useRouter } from 'next/router';
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
import { SalaryRequestStatusEnum } from 'src/graphql/types.generated';
import { useStepList } from 'src/hooks/useStepList';
import { useTrackMutation } from 'src/hooks/useTrackMutation';
import { getQueryParam } from 'src/lib/queryParam';
import { FormEnum } from '../../Shared/CalculationReports/Shared/sharedTypes';
import { Steps } from '../../Shared/CalculationReports/StepsList/StepsList';
import { HcmQuery, useHcmQuery } from '../../Shared/HcmData/Hcm.generated';
import { useHcmUnavailable } from '../../Shared/HcmData/useHcmUnavailable';
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

  hcmUser: HcmQuery['hcm'][number] | null;
  hcmSpouse: HcmQuery['hcm'][number] | null;
  hasSpouse: boolean;
  calculation: SalaryCalculationQuery['salaryRequest'] | null;
  hcmUnavailable: boolean;
  refetchHcm: () => Promise<unknown>;
  calculationError: boolean;
  refetchCalculation: () => void;

  /** Whether any mutations are currently in progress */
  isMutating: boolean;
  /** Call with the mutation promise to track the start and end of mutations */
  trackMutation: <T>(mutation: Promise<T>) => Promise<T>;
  loading: boolean;
  /** Whether the calculation is being edited or viewed */
  editing: boolean;
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
  const { query } = useRouter();
  const { mode } = query;
  const calculationId = getQueryParam(query, 'calculationId') || '';

  const {
    data: calculationData,
    loading,
    error: calculationQueryError,
    refetch: refetchCalculationQuery,
  } = useSalaryCalculationQuery({
    variables: { id: calculationId },
    skip: !calculationId,
  });
  const calculation = calculationData?.salaryRequest ?? null;

  const {
    data: hcmData,
    error: hcmError,
    refetch: refetchHcmQuery,
  } = useHcmQuery({
    variables: { effectiveDate: calculation?.effectiveDate },
    skip: !calculation,
  });
  const { hcmUnavailable, refetchHcm } = useHcmUnavailable(
    { error: hcmError, refetch: refetchHcmQuery },
    { error: calculationQueryError, refetch: refetchCalculationQuery },
  );

  const refetchCalculation = useCallback(() => {
    // hcmError here is any Hcm query failure other than HCM_UNAVAILABLE (that case is handled by
    // hcmUnavailable/refetchHcm above) - e.g. HCM_PERSON_NOT_FOUND, which isn't recoverable by
    // retrying but should still surface as a load error instead of silently rendering the form
    // with no HCM data (which previously made every HCM-backed autosave fail silently).
    if (hcmError && !hcmUnavailable) {
      refetchHcmQuery().catch(() => {});
    }
    refetchCalculationQuery().catch(() => {});
  }, [hcmError, hcmUnavailable, refetchHcmQuery, refetchCalculationQuery]);

  const { trackMutation, isMutating } = useTrackMutation();

  const statusAllowsEditing =
    calculation?.status === SalaryRequestStatusEnum.InProgress ||
    calculation?.status === SalaryRequestStatusEnum.ActionRequired;
  const editing = statusAllowsEditing && mode !== 'view';

  const {
    steps,
    handleNextStep,
    handlePreviousStep,
    currentIndex,
    percentComplete,
  } = useStepList(FormEnum.SalaryCalc);

  const [isDrawerOpen, setDrawerOpen] = useState(true);
  const toggleDrawer = useCallback(() => {
    setDrawerOpen((prev) => !prev);
  }, []);

  const contextValue: SalaryCalculatorContextType = useMemo(() => {
    const hcmSpouse = hcmData?.hcm[1] ?? null;
    const eligibleSpouse = hcmSpouse?.salaryRequestEligible ? hcmSpouse : null;
    return {
      steps,
      currentIndex,
      percentComplete,
      handleNextStep,
      handlePreviousStep,
      isDrawerOpen,
      setDrawerOpen,
      toggleDrawer,
      hcmUser: hcmData?.hcm[0] ?? null,
      // Ignore spouses that aren't eligible to make a salary request
      hcmSpouse: eligibleSpouse,
      hasSpouse: !!eligibleSpouse,
      calculation,
      hcmUnavailable,
      refetchHcm,
      calculationError:
        !!calculationQueryError || (!!hcmError && !hcmUnavailable),
      refetchCalculation,
      isMutating,
      trackMutation,
      loading,
      editing,
    };
  }, [
    steps,
    currentIndex,
    percentComplete,
    handleNextStep,
    handlePreviousStep,
    isDrawerOpen,
    toggleDrawer,
    hcmData,
    hcmError,
    hcmUnavailable,
    refetchHcm,
    calculationQueryError,
    refetchCalculation,
    calculationData,
    isMutating,
    trackMutation,
    loading,
    editing,
  ]);

  if (calculationId && !calculationData && !calculationQueryError) {
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
