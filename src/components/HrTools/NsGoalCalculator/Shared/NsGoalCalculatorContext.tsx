import React, { createContext, useCallback, useMemo, useState } from 'react';
import { ApolloError } from '@apollo/client';
import { useAccountListId } from 'src/hooks/useAccountListId';
import {
  NewStaffGoalCalculationQuery,
  useNewStaffGoalCalculationQuery,
} from '../GoalSettings/NewStaffGoalCalculation.generated';
import { NsGoalCalculatorStepEnum } from '../NsGoalCalculatorHelper';
import { NsGoalCalculatorStep, useSteps } from './useSteps';

export type NsGoalCalculation = NonNullable<
  NewStaffGoalCalculationQuery['newStaffGoalCalculation']
>;

export type NsGoalCalculatorType = {
  steps: NsGoalCalculatorStep[];
  currentStep: NsGoalCalculatorStep;
  currentIndex: number;
  isDrawerOpen: boolean;
  /** The current goal calculation, or null if none exists for this account. */
  goalCalculation: NsGoalCalculation | null;
  goalCalculationLoading: boolean;
  goalCalculationError: ApolloError | undefined;
  handleStepChange: (step: NsGoalCalculatorStepEnum) => void;
  handleContinue: () => void;
  toggleDrawer: () => void;
};

const NsGoalCalculatorContext = createContext<NsGoalCalculatorType | null>(
  null,
);

export const useNsGoalCalculator = (): NsGoalCalculatorType => {
  const context = React.useContext(NsGoalCalculatorContext);
  if (context === null) {
    throw new Error(
      'Could not find NsGoalCalculatorContext. Make sure that your component is inside <NsGoalCalculatorProvider>.',
    );
  }
  return context;
};

interface Props {
  children?: React.ReactNode;
}

export const NsGoalCalculatorProvider: React.FC<Props> = ({ children }) => {
  const steps = useSteps();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const accountListId = useAccountListId();

  const {
    data: goalCalculationData,
    loading: goalCalculationLoading,
    error: goalCalculationError,
  } = useNewStaffGoalCalculationQuery({
    variables: { accountListId: accountListId ?? '' },
    skip: !accountListId,
  });
  const goalCalculation = goalCalculationData?.newStaffGoalCalculation ?? null;

  const currentStep = steps[currentIndex];

  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen((prev) => !prev);
  }, []);

  const handleStepChange = useCallback(
    (newStep: NsGoalCalculatorStepEnum) => {
      const newIndex = steps.findIndex((step) => step.step === newStep);
      if (newIndex !== -1) {
        setCurrentIndex(newIndex);
      }
    },
    [steps],
  );

  const handleContinue = useCallback(() => {
    if (currentIndex < steps.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [steps, currentIndex]);

  const contextValue = useMemo(
    (): NsGoalCalculatorType => ({
      steps,
      currentStep,
      currentIndex,
      isDrawerOpen,
      goalCalculation,
      goalCalculationLoading,
      goalCalculationError,
      handleStepChange,
      handleContinue,
      toggleDrawer,
    }),
    [
      steps,
      currentStep,
      currentIndex,
      isDrawerOpen,
      goalCalculation,
      goalCalculationLoading,
      goalCalculationError,
      handleStepChange,
      handleContinue,
      toggleDrawer,
    ],
  );

  return (
    <NsGoalCalculatorContext.Provider value={contextValue}>
      {children}
    </NsGoalCalculatorContext.Provider>
  );
};
