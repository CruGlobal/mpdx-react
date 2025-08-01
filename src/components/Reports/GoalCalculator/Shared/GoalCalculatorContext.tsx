import React, { useCallback, useMemo, useState } from 'react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useCalculatorSettings } from '../CalculatorSettings/CalculatorSettings';
import {
  GoalCalculatorCategory,
  GoalCalculatorCategoryEnum,
  GoalCalculatorCategoryStep,
  GoalCalculatorStepEnum,
} from '../GoalCalculatorHelper';
import { useHouseholdExpenses } from '../HouseholdExpenses/HouseholdExpenses';
import { useMinistryExpenses } from '../MinistryExpenses/MinistryExpenses';
import { useSummaryReport } from '../SummaryReport/SummaryReport';

export type GoalCalculatorType = {
  categories: GoalCalculatorCategory[];
  selectedCategoryId: GoalCalculatorCategoryEnum;
  selectedStepId: GoalCalculatorStepEnum;
  currentCategory?: GoalCalculatorCategory;
  currentStep?: GoalCalculatorCategoryStep;
  isRightOpen: boolean;
  isDrawerOpen: boolean;
  handleCategoryChange: (categoryId: GoalCalculatorCategoryEnum) => void;
  handleStepChange: (stepId: GoalCalculatorStepEnum) => void;
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
  const categories = [
    useCalculatorSettings(),
    useHouseholdExpenses(),
    useMinistryExpenses(),
    useSummaryReport(),
  ];

  const [selectedCategoryId, setSelectedCategoryId] =
    useState<GoalCalculatorCategoryEnum>(
      GoalCalculatorCategoryEnum.CalculatorSettings,
    );
  const [selectedStepId, setSelectedStepId] = useState<GoalCalculatorStepEnum>(
    GoalCalculatorStepEnum.Information,
  );
  const [isRightOpen, setIsRightOpen] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);

  const currentCategory = useMemo(
    () => categories.find((cat) => cat.id === selectedCategoryId),
    [categories, selectedCategoryId],
  );
  const currentStep = useMemo(
    () => currentCategory?.steps.find((step) => step.id === selectedStepId),
    [currentCategory, selectedStepId],
  );

  const handleCategoryChange = useCallback(
    (categoryId: GoalCalculatorCategoryEnum) => {
      const category = categories.find((cat) => cat.id === categoryId);
      if (category) {
        setSelectedCategoryId(categoryId);
        setSelectedStepId(category.steps[0].id);
      } else {
        enqueueSnackbar(t('The selected category does not exist.'), {
          variant: 'error',
        });
      }
    },
    [categories, enqueueSnackbar, t],
  );

  const handleStepChange = useCallback(
    (stepId: GoalCalculatorStepEnum) => {
      const stepIsDefined = currentCategory?.steps.find(
        (step) => step.id === stepId,
      );
      if (stepIsDefined) {
        setSelectedStepId(stepId);
      } else {
        enqueueSnackbar(
          t('The selected step does not exist in the current category.'),
          {
            variant: 'error',
          },
        );
      }
    },
    [currentCategory, enqueueSnackbar, t],
  );

  const handleContinue = useCallback(() => {
    const currentStepIndex = currentCategory?.steps.findIndex(
      (step) => step.id === selectedStepId,
    );
    if (currentStepIndex === undefined || currentStepIndex < 0) {
      enqueueSnackbar(t('Current step is not defined or does not exist.'), {
        variant: 'error',
      });
      return;
    }
    const nextStepIndex = currentStepIndex + 1;

    if (currentCategory?.steps[nextStepIndex]) {
      // If next step exists, change to that step
      setSelectedStepId(currentCategory.steps[nextStepIndex].id);
    } else {
      // If no next step, check to find the next category
      const nextCategoryIndex =
        categories.findIndex((cat) => cat.id === selectedCategoryId) + 1;
      const nextCategory = categories[nextCategoryIndex];
      if (nextCategory) {
        setSelectedCategoryId(nextCategory.id);
        setSelectedStepId(nextCategory.steps[0].id);
      } else {
        enqueueSnackbar(t('You have reached the end of the goal calculator.'), {
          variant: 'info',
        });
      }
    }
  }, [
    categories,
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
      categories,
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
