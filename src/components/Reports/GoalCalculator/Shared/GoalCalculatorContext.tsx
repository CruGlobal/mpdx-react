import React, { useCallback, useMemo, useState } from 'react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useCalculatorSettings } from '../CalculatorSettings/CalculatorSettings';
import {
  GoalCalculatorCategory,
  GoalCalculatorCategoryEnum,
  GoalCalculatorStep,
  GoalCalculatorStepEnum,
} from '../GoalCalculatorHelper';
import { useHouseholdExpenses } from '../HouseholdExpenses/HouseholdExpenses';
import { useMinistryExpenses } from '../MinistryExpenses/MinistryExpenses';
import { useSummaryReport } from '../SummaryReport/SummaryReport';

export type GoalCalculatorType = {
  steps: GoalCalculatorStep[];
  selectedStepId: GoalCalculatorStepEnum;
  selectedCategoryId: GoalCalculatorCategoryEnum;
  currentStep?: GoalCalculatorStep;
  currentCategory?: GoalCalculatorCategory;
  isRightOpen: boolean;
  isDrawerOpen: boolean;
  handleStepChange: (stepId: GoalCalculatorStepEnum) => void;
  handleCategoryChange: (categoryId: GoalCalculatorCategoryEnum) => void;
  handleContinue: () => void;
  toggleRightPanel: () => void;
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

  // Static categories - no memoization to avoid React queue issues
  const steps = [
    useCalculatorSettings(),
    useHouseholdExpenses(),
    useMinistryExpenses(),
    useSummaryReport(),
  ];

  const [selectedStepId, setSelectedStepId] = useState(
    GoalCalculatorStepEnum.CalculatorSettings,
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    GoalCalculatorCategoryEnum.Information,
  );
  const [isRightOpen, setIsRightOpen] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);

  const currentStep = useMemo(
    () => steps.find((step) => step.id === selectedStepId),
    [steps, selectedCategoryId],
  );
  const currentCategory = useMemo(
    () =>
      currentStep?.categories.find(
        (category) => category.id === selectedCategoryId,
      ),
    [currentStep, selectedStepId],
  );

  const handleStepChange = useCallback(
    (stepId: GoalCalculatorStepEnum) => {
      const step = steps.find((step) => step.id === stepId);
      if (step) {
        setSelectedStepId(stepId);
        setSelectedCategoryId(step.categories[0].id);
      } else {
        enqueueSnackbar(t('The selected step does not exist.'), {
          variant: 'error',
        });
      }
    },
    [steps, enqueueSnackbar, t],
  );

  const handleCategoryChange = useCallback(
    (categoryId: GoalCalculatorCategoryEnum) => {
      const categoryIsDefined = currentStep?.categories.find(
        (step) => step.id === categoryId,
      );
      if (categoryIsDefined) {
        setSelectedCategoryId(categoryId);
      } else {
        enqueueSnackbar(
          t('The selected category does not exist in the current step.'),
          {
            variant: 'error',
          },
        );
      }
    },
    [currentStep, enqueueSnackbar, t],
  );

  const handleContinue = useCallback(() => {
    const currentCategoryIndex = currentStep?.categories.findIndex(
      (category) => category.id === selectedCategoryId,
    );
    if (currentCategoryIndex === undefined || currentCategoryIndex < 0) {
      enqueueSnackbar(t('Current step is not defined or does not exist.'), {
        variant: 'error',
      });
      return;
    }
    const nextCategoryIndex = currentCategoryIndex + 1;

    if (currentStep?.categories[nextCategoryIndex]) {
      // If next step exists, change to that step
      setSelectedCategoryId(currentStep?.categories[nextCategoryIndex].id);
    } else {
      // If no next step, check to find the next category
      const nextCategoryIndex =
        steps.findIndex((step) => step.id === selectedStepId) + 1;
      const nextStep = steps[nextCategoryIndex];
      if (nextStep) {
        setSelectedCategoryId(nextStep.categories[0].id);
        setSelectedStepId(nextStep.id);
      } else {
        enqueueSnackbar(t('You have reached the end of the goal calculator.'), {
          variant: 'info',
        });
      }
    }
  }, [
    steps,
    currentCategory,
    enqueueSnackbar,
    selectedCategoryId,
    selectedStepId,
    t,
  ]);

  const toggleRightPanel = useCallback(() => {
    setIsRightOpen((prev) => !prev);
  }, []);

  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen((prev) => !prev);
  }, []);

  const setDrawerOpen = useCallback((open: boolean) => {
    setIsDrawerOpen(open);
  }, []);
  const contextValue: GoalCalculatorType = useMemo(
    () => ({
      steps,
      selectedCategoryId,
      selectedStepId,
      currentCategory,
      currentStep,
      isRightOpen,
      isDrawerOpen,
      handleCategoryChange,
      handleStepChange,
      handleContinue,
      toggleRightPanel,
      toggleDrawer,
      setDrawerOpen,
    }),
    [
      selectedCategoryId,
      selectedStepId,
      currentCategory,
      currentStep,
      isRightOpen,
      isDrawerOpen,
      handleCategoryChange,
      handleStepChange,
      handleContinue,
      toggleRightPanel,
      toggleDrawer,
      setDrawerOpen,
    ],
  );

  return (
    <GoalCalculatorContext.Provider value={contextValue}>
      {children}
    </GoalCalculatorContext.Provider>
  );
};
