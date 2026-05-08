import { useRouter } from 'next/router';
import React, {
  createContext,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useTrackMutation } from 'src/hooks/useTrackMutation';
import {
  PdsGoalCalculationFieldsFragment,
  usePdsGoalCalculationQuery,
} from '../GoalsList/PdsGoalCalculations.generated';
import { PdsGoalCalculatorStepEnum } from '../PdsGoalCalculatorHelper';
import {
  PdsSummaryData,
  usePdsSummaryData,
} from '../calculations/usePdsSummaryData';
import { HcmUserQuery, useHcmUserQuery } from './HCM.generated';
import { PdsGoalCalculatorStep, useSteps } from './useSteps';

export type PdsGoalCalculatorType = {
  steps: PdsGoalCalculatorStep[];
  currentStep: PdsGoalCalculatorStep;

  calculation?: PdsGoalCalculationFieldsFragment;
  calculationLoading: boolean;
  hcmUser?: HcmUserQuery['hcm'][number];
  summaryData: PdsSummaryData | null;

  /** Whether any mutations are currently in progress */
  isMutating: boolean;
  /** Call with the mutation promise to track the start and end of mutations */
  trackMutation: <T>(mutation: Promise<T>) => Promise<T>;

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

  const { data: hcmData } = useHcmUserQuery();
  const hcmUser = hcmData?.hcm[0];

  const summaryData = usePdsSummaryData(calculation, hcmUser);

  const steps = useSteps(calculation?.formType);
  // Track the user's place by step enum, not numeric index, so that a change
  // to the steps array (e.g. formType switch Detailed → Simple, dropping the
  // ReimbursableExpenses step) preserves their step when it still exists and
  // falls back to Setup only when it doesn't.
  const [activeStep, setActiveStep] = useState<PdsGoalCalculatorStepEnum>(
    PdsGoalCalculatorStepEnum.Setup,
  );
  const [rightPanelContent, setRightPanelContent] =
    useState<React.ReactNode>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);
  const { trackMutation, isMutating } = useTrackMutation();

  const stepIndex = useMemo(() => {
    const idx = steps.findIndex((s) => s.step === activeStep);
    return idx === -1 ? 0 : idx;
  }, [steps, activeStep]);

  const currentStep = steps[stepIndex];

  const handleStepChange = useCallback(
    (newStep: PdsGoalCalculatorStepEnum) => {
      if (steps.some((step) => step.step === newStep)) {
        setActiveStep(newStep);
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
      setActiveStep(steps[stepIndex + 1].step);
    }
  }, [stepIndex, steps]);

  const handlePreviousStep = useCallback(() => {
    if (stepIndex > 0) {
      setActiveStep(steps[stepIndex - 1].step);
    }
  }, [stepIndex, steps]);

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
      summaryData,
      isMutating,
      trackMutation,
      hcmUser,
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
      summaryData,
      isMutating,
      trackMutation,
      hcmUser,
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
