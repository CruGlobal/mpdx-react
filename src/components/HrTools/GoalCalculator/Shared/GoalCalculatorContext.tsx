import { useRouter } from 'next/router';
import React, {
  Dispatch,
  SetStateAction,
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { MpdGoalBenefitsConstantSizeEnum } from 'src/graphql/types.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useTrackMutation } from 'src/hooks/useTrackMutation';
import { getQueryParam } from 'src/utils/queryParam';
import { useGoalCalculatorConstants } from '../../../../hooks/useGoalCalculatorConstants';
import {
  GoalCalculatorReportEnum,
  GoalCalculatorStepEnum,
} from '../GoalCalculatorHelper';
import { useGoalCalculationQuery } from './GoalCalculation.generated';
import { completionPercentage } from './calculateCompletion';
import { GoalTotals, calculateGoalTotals } from './calculateTotals';
import { DefaultTypeEnum, getDefaultType } from './getDefaultType';
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
  goalTotals: GoalTotals;

  /** Whether any mutations are currently in progress */
  isMutating: boolean;
  /** Call with the mutation promise to track the start and end of mutations */
  trackMutation: <T>(mutation: Promise<T>) => Promise<T>;
  percentComplete: number;

  defaultType: DefaultTypeEnum;
  isMarried: boolean;

  defaultTypeChanged: boolean;
  clearDefaultTypeChanged: () => void;
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

  const role = goalCalculationResult.data?.goalCalculation?.role ?? null;
  const familySize =
    goalCalculationResult.data?.goalCalculation?.familySize ?? null;

  const isMarried =
    familySize === MpdGoalBenefitsConstantSizeEnum.MarriedNoChildren ||
    familySize === MpdGoalBenefitsConstantSizeEnum.MarriedOneToTwoChildren ||
    familySize === MpdGoalBenefitsConstantSizeEnum.MarriedThreeOrMoreChildren;

  const defaultType = getDefaultType(role, isMarried);

  // Track when defaultType changes (not on initial load)
  const previousDefaultTypeRef = useRef<DefaultTypeEnum | null>(null);
  const [defaultTypeChanged, setDefaultTypeChanged] = useState(false);

  useEffect(() => {
    const previousDefaultType = previousDefaultTypeRef.current;

    if (previousDefaultType && previousDefaultType !== defaultType) {
      setDefaultTypeChanged(true);
    }

    previousDefaultTypeRef.current = defaultType;
  }, [defaultType]);

  const clearDefaultTypeChanged = useCallback(() => {
    setDefaultTypeChanged(false);
  }, []);

  const constants = useGoalCalculatorConstants();

  const steps = useSteps();
  const percentComplete = useMemo(
    () => completionPercentage(goalCalculationResult.data?.goalCalculation),
    [goalCalculationResult.data],
  );
  const goalTotals = useMemo(
    () =>
      calculateGoalTotals(
        goalCalculationResult.data?.goalCalculation ?? null,
        constants,
      ),
    [goalCalculationResult.data, constants],
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedReport, setSelectedReport] =
    useState<GoalCalculatorReportEnum>(GoalCalculatorReportEnum.MpdGoal);
  const [rightPanelContent, setRightPanelContent] =
    useState<JSX.Element | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);
  const { trackMutation, isMutating } = useTrackMutation();

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
      goalTotals,
      defaultType,
      isMarried,
      defaultTypeChanged,
      clearDefaultTypeChanged,
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
      goalTotals,
      defaultType,
      isMarried,
      defaultTypeChanged,
      clearDefaultTypeChanged,
    ],
  );

  return (
    <GoalCalculatorContext.Provider value={contextValue}>
      {children}
    </GoalCalculatorContext.Provider>
  );
};
