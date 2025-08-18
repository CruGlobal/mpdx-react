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
import { useCalculatorSettings } from '../CalculatorSettings/CalculatorSettings';
import {
  GoalCalculatorReportEnum,
  GoalCalculatorStep,
  GoalCalculatorStepEnum,
} from '../GoalCalculatorHelper';
import { useHouseholdExpenses } from '../HouseholdExpenses/HouseholdExpenses';
import { useMinistryExpenses } from '../MinistryExpenses/MinistryExpenses';
import { useSummaryReport } from '../SummaryReport/useSummaryReport';

export type GoalCalculatorType = {
  steps: GoalCalculatorStep[];
  selectedStepId: GoalCalculatorStepEnum;
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

  // Static categories - no memoization to avoid React queue issues
  const steps = [
    useCalculatorSettings(),
    useMinistryExpenses(),
    useHouseholdExpenses(),
    useSummaryReport(),
  ];

  const [selectedStepId, setSelectedStepId] = useState(
    GoalCalculatorStepEnum.CalculatorSettings,
  );
  const [selectedReport, setSelectedReport] =
    useState<GoalCalculatorReportEnum>(GoalCalculatorReportEnum.MpdGoal);
  const [rightPanelContent, setRightPanelContent] =
    useState<JSX.Element | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);

  const currentStep = useMemo(() => {
    const selectedStep = steps.find((step) => step.id === selectedStepId);
    if (!selectedStep) {
      throw new Error('Invalid step');
    }
    return selectedStep;
  }, [steps, selectedStepId]);

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
  }, [steps, selectedStepId, handleStepChange, enqueueSnackbar, t]);

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
    }),
    [
      selectedStepId,
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
    ],
  );

  return (
    <GoalCalculatorContext.Provider value={contextValue}>
      {children}
    </GoalCalculatorContext.Provider>
  );
};
