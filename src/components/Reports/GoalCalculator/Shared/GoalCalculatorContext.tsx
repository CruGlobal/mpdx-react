import { useRouter } from 'next/router';
import React, { useCallback, useMemo, useState } from 'react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useCalculatorSettings } from '../CalculatorSettings/CalculatorSettings';
import {
  GoalCalculatorStep,
  GoalCalculatorStepEnum,
} from '../GoalCalculatorHelper';
import { useHouseholdExpenses } from '../HouseholdExpenses/HouseholdExpenses';
import { useMinistryExpenses } from '../MinistryExpenses/MinistryExpenses';
import { useSummaryReport } from '../SummaryReport/SummaryReport';

// Helper function to get step enum from router query
const getStepFromRouterQuery = (
  query: Record<string, string | string[] | undefined>,
): GoalCalculatorStepEnum => {
  // With the new route structure, goalStep is directly available
  const { goalStep } = query;

  const stepMap: Record<string, GoalCalculatorStepEnum> = {
    'calculator-settings': GoalCalculatorStepEnum.CalculatorSettings,
    'household-expenses': GoalCalculatorStepEnum.HouseholdExpenses,
    'ministry-expenses': GoalCalculatorStepEnum.MinistryExpenses,
    'summary-report': GoalCalculatorStepEnum.SummaryReport,
  };

  const stepValue = Array.isArray(goalStep) ? goalStep[0] : goalStep;
  return stepMap[stepValue || ''] || GoalCalculatorStepEnum.CalculatorSettings;
};

export type GoalCalculatorType = {
  steps: GoalCalculatorStep[];
  selectedStepId: GoalCalculatorStepEnum;
  currentStep?: GoalCalculatorStep;
  goalCalculatorId?: string;
  goalStep?: string;

  /** Restructured query parameters in the desired format */
  queryParams: {
    accountListId?: string | string[];
    goalCalculatorId?: string;
    goalStep?: string;
  };

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
};

const GoalCalculatorContext = React.createContext<GoalCalculatorType | null>(
  null,
);

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
  const router = useRouter();

  // Extract goalCalculatorId and goalStep directly from router query
  const { goalCalculatorId, goalStep, accountListId } = router.query;

  // Create the restructured query parameters in the desired format
  const queryParams = useMemo(
    () => ({
      accountListId,
      goalCalculatorId: Array.isArray(goalCalculatorId)
        ? goalCalculatorId[0]
        : goalCalculatorId,
      goalStep: Array.isArray(goalStep) ? goalStep[0] : goalStep,
    }),
    [accountListId, goalCalculatorId, goalStep],
  );

  // Static categories - no memoization to avoid React queue issues
  const steps = [
    useCalculatorSettings(),
    useHouseholdExpenses(),
    useMinistryExpenses(),
    useSummaryReport(),
  ];

  // Use router query to determine initial step, fallback to CalculatorSettings
  const initialStepId = getStepFromRouterQuery(router.query);

  const [selectedStepId, setSelectedStepId] = useState(initialStepId);
  const [rightPanelContent, setRightPanelContent] =
    useState<JSX.Element | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);

  const currentStep = useMemo(
    () => steps.find((step) => step.id === selectedStepId),
    [steps, selectedStepId],
  );

  const handleStepChange = useCallback(
    (stepId: GoalCalculatorStepEnum) => {
      const step = steps.find((step) => step.id === stepId);
      if (step) {
        setSelectedStepId(stepId);
      } else {
        enqueueSnackbar(t('The selected step does not exist.'), {
          variant: 'error',
        });
      }
    },
    [steps, enqueueSnackbar, t],
  );

  const handleContinue = useCallback(() => {
    const nextStepIndex =
      steps.findIndex((step) => step.id === selectedStepId) + 1;
    const nextStep = steps[nextStepIndex];
    if (nextStep) {
      setSelectedStepId(nextStep.id);
    } else {
      enqueueSnackbar(t('You have reached the end of the goal calculator.'), {
        variant: 'info',
      });
    }
  }, [steps, enqueueSnackbar, selectedStepId, t]);

  const closeRightPanel = useCallback(() => {
    setRightPanelContent(null);
  }, []);

  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen((prev) => !prev);
  }, []);

  const contextValue: GoalCalculatorType = useMemo(
    () => ({
      steps,
      selectedStepId,
      currentStep,
      goalCalculatorId: queryParams.goalCalculatorId,
      goalStep: queryParams.goalStep,
      queryParams,
      rightPanelContent,
      isDrawerOpen,
      handleStepChange,
      handleContinue,
      setRightPanelContent,
      closeRightPanel,
      toggleDrawer,
      setDrawerOpen: setIsDrawerOpen,
    }),
    [
      selectedStepId,
      currentStep,
      queryParams,
      rightPanelContent,
      isDrawerOpen,
      handleStepChange,
      handleContinue,
      setRightPanelContent,
      closeRightPanel,
      toggleDrawer,
      setIsDrawerOpen,
    ],
  );

  return (
    <GoalCalculatorContext.Provider value={contextValue}>
      {children}
    </GoalCalculatorContext.Provider>
  );
};
