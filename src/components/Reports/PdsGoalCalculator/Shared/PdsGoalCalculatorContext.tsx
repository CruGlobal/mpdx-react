import { useRouter } from 'next/router';
import React, { createContext, useCallback, useMemo, useState } from 'react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import {
  PdsGoalCalculationFieldsFragment,
  usePdsGoalCalculationQuery,
} from '../GoalsList/PdsGoalCalculations.generated';
import { PdsGoalCalculatorStepEnum } from '../PdsGoalCalculatorHelper';
import { PdsGoalCalculatorStep, useSteps } from './useSteps';

export type PdsGoalCalculatorType = {
  steps: PdsGoalCalculatorStep[];
  currentStep: PdsGoalCalculatorStep;

  calculation?: PdsGoalCalculationFieldsFragment;
  calculationLoading: boolean;

  rightPanelContent: React.ReactNode;
  setRightPanelContent: (content: React.ReactNode) => void;
  closeRightPanel: () => void;

  stepIndex: number;
  isDrawerOpen: boolean;
  handleStepChange: (stepId: PdsGoalCalculatorStepEnum) => void;
  handleContinue: () => void;
  handlePreviousStep: () => void;
  toggleDrawer: () => void;
  setDrawerOpen: (open: boolean) => void;
};

const PdsGoalCalculatorContext = createContext<PdsGoalCalculatorType | null>(
  null,
);

export const usePdsGoalCalculator = (): PdsGoalCalculatorType => {
  const context = React.useContext(PdsGoalCalculatorContext);
  if (context === null) {
    throw new Error(
      'Could not find PdsGoalCalculatorContext. Make sure that your component is inside <PdsGoalCalculatorProvider>.',
    );
  }
  return context;
};

interface Props {
  children?: React.ReactNode;
}

export const PdsGoalCalculatorProvider: React.FC<Props> = ({ children }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const router = useRouter();
  const pdsGoalId = (router.query.pdsGoalId as string) ?? '';

  const { data: calculationData, loading: calculationLoading } =
    usePdsGoalCalculationQuery({
      variables: { id: pdsGoalId },
      skip: !pdsGoalId,
    });
  const calculation = calculationData?.designationSupportCalculation;

  const steps = useSteps();
  const [stepIndex, setStepIndex] = useState(0);
  const [rightPanelContent, setRightPanelContent] =
    useState<React.ReactNode>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);

  const currentStep = steps[stepIndex];

  const handleStepChange = useCallback(
    (newStep: PdsGoalCalculatorStepEnum) => {
      const newIndex = steps.findIndex((step) => step.step === newStep);
      if (newIndex !== -1) {
        setStepIndex(newIndex);
      } else {
        enqueueSnackbar(t('The selected step does not exist.'), {
          variant: 'error',
        });
      }
    },
    [steps, enqueueSnackbar, t],
  );

  const handleContinue = useCallback(() => {
    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1);
    }
  }, [stepIndex, steps]);

  const handlePreviousStep = useCallback(() => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    }
  }, [stepIndex]);

  const closeRightPanel = useCallback(() => {
    setRightPanelContent(null);
  }, []);

  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen((prev) => !prev);
  }, []);

  const contextValue = useMemo(
    (): PdsGoalCalculatorType => ({
      steps,
      currentStep,
      stepIndex,
      calculation,
      calculationLoading,
      rightPanelContent,
      isDrawerOpen,
      handleStepChange,
      handleContinue,
      handlePreviousStep,
      setRightPanelContent,
      closeRightPanel,
      toggleDrawer,
      setDrawerOpen: setIsDrawerOpen,
    }),
    [
      steps,
      currentStep,
      stepIndex,
      calculation,
      calculationLoading,
      rightPanelContent,
      isDrawerOpen,
      handleStepChange,
      handleContinue,
      handlePreviousStep,
      setRightPanelContent,
      closeRightPanel,
      toggleDrawer,
      setIsDrawerOpen,
    ],
  );

  return (
    <PdsGoalCalculatorContext.Provider value={contextValue}>
      {children}
    </PdsGoalCalculatorContext.Provider>
  );
};
