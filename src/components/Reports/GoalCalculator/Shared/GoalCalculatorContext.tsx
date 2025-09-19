import { useRouter } from 'next/router';
import React, {
  Dispatch,
  SetStateAction,
  createContext,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { getQueryParam } from 'src/utils/queryParam';
import {
  GoalCalculatorReportEnum,
  GoalCalculatorStepEnum,
} from '../GoalCalculatorHelper';
import { useGoalCalculationQuery } from './GoalCalculation.generated';
import { calculatePercentage } from './calculatePercentage';
import { GoalCalculatorStep, useSteps } from './useSteps';

export type GoalCalculatorType = {
  steps: GoalCalculatorStep[];
  currentStep: GoalCalculatorStep;
  selectedReport: GoalCalculatorReportEnum;
  setSelectedReport: Dispatch<SetStateAction<GoalCalculatorReportEnum>>;

  /** The current contents of the right panel, or null if it is closed */
  rightPanelContent: JSX.Element | null;
  /** Open the right panel the provided content */
  setRightPanelContent: (content: JSX.Element) => void;
  /** Close the right panel */
  closeRightPanel: () => void;

  isDrawerOpen: boolean;
  handleStepChange: (stepId: GoalCalculatorStepEnum) => void;
  handleContinue: () => void;
  toggleDrawer: () => void;
  setDrawerOpen: (open: boolean) => void;

  goalCalculationResult: ReturnType<typeof useGoalCalculationQuery>;
  /** Whether any mutations are currently in progress */
  isMutating: boolean;
  /** Call with the mutation promise to track the start and end of mutations */
  trackMutation: <T>(mutation: Promise<T>) => Promise<T>;
  percentComplete: number;
};

const GoalCalculatorContext = createContext<GoalCalculatorType | null>(null);

export const useGoalCalculator = (): GoalCalculatorType => {
  const context = React.useContext(GoalCalculatorContext);
  if (context === null) {
    throw new Error(
      'Could not find GoalCalculatorContext. Make sure that your component is inside <GoalCalculatorProvider>.',
    );
  }
  return context;
};

interface Props {
  children?: React.ReactNode;
}

export const GoalCalculatorProvider: React.FC<Props> = ({ children }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const accountListId = useAccountListId() ?? '';
  const { query } = useRouter();
  const goalCalculationId = getQueryParam(query, 'goalCalculationId') ?? '';

  const goalCalculationResult = useGoalCalculationQuery({
    variables: {
      accountListId,
      id: goalCalculationId,
    },
  });

  const steps = useSteps();
  const percentComplete = useMemo(
    () => calculatePercentage(goalCalculationResult.data?.goalCalculation),
    [goalCalculationResult.data],
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedReport, setSelectedReport] =
    useState<GoalCalculatorReportEnum>(GoalCalculatorReportEnum.MpdGoal);
  const [rightPanelContent, setRightPanelContent] =
    useState<JSX.Element | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);
  const [mutationCount, setMutationCount] = useState(0);
  const isMutating = mutationCount > 0;

  const currentStep = steps[stepIndex];

  const handleStepChange = useCallback(
    (newStep: GoalCalculatorStepEnum) => {
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
    } else {
      enqueueSnackbar(t('You have reached the end of the goal calculator.'), {
        variant: 'info',
      });
    }
  }, [steps, stepIndex, enqueueSnackbar, t]);

  const closeRightPanel = useCallback(() => {
    setRightPanelContent(null);
  }, []);

  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen((prev) => !prev);
  }, []);

  const trackMutation = useCallback(
    async <T,>(mutation: Promise<T>): Promise<T> => {
      setMutationCount((prev) => prev + 1);
      return mutation.finally(() => {
        setMutationCount((prev) => Math.max(0, prev - 1));
      });
    },
    [],
  );

  const contextValue = useMemo(
    (): GoalCalculatorType => ({
      steps,
      currentStep,
      rightPanelContent,
      isDrawerOpen,
      handleStepChange,
      handleContinue,
      setRightPanelContent,
      closeRightPanel,
      toggleDrawer,
      setDrawerOpen: setIsDrawerOpen,
      selectedReport,
      setSelectedReport,
      goalCalculationResult,
      isMutating,
      trackMutation,
      percentComplete,
    }),
    [
      steps,
      currentStep,
      rightPanelContent,
      isDrawerOpen,
      handleStepChange,
      handleContinue,
      setRightPanelContent,
      closeRightPanel,
      toggleDrawer,
      setIsDrawerOpen,
      selectedReport,
      setSelectedReport,
      goalCalculationResult,
      isMutating,
      trackMutation,
      percentComplete,
    ],
  );

  return (
    <GoalCalculatorContext.Provider value={contextValue}>
      {children}
    </GoalCalculatorContext.Provider>
  );
};
