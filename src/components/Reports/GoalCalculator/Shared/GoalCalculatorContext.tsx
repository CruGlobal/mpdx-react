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
  selectedCategoryID: GoalCalculatorCategoryEnum;
  selectedStepID: GoalCalculatorStepEnum;
  currentCategory?: GoalCalculatorCategory;
  currentStep?: GoalCalculatorCategoryStep;
  handleCategoryChange: (categoryId: GoalCalculatorCategoryEnum) => void;
  handleStepChange: (stepId: GoalCalculatorStepEnum) => void;
  handleContinue: () => void;
};

export const GoalCalculatorContext =
  React.createContext<GoalCalculatorType | null>(null);

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

  const [selectedCategoryID, setSelectedCategoryID] =
    useState<GoalCalculatorCategoryEnum>(
      GoalCalculatorCategoryEnum.CalculatorSettings,
    );
  const [selectedStepID, setSelectedStepID] = useState<GoalCalculatorStepEnum>(
    GoalCalculatorStepEnum.Information,
  );

  const currentCategory = useMemo(
    () => categories.find((cat) => cat.id === selectedCategoryID),
    [categories, selectedCategoryID],
  );
  const currentStep = useMemo(
    () => currentCategory?.steps.find((step) => step.id === selectedStepID),
    [currentCategory, selectedStepID],
  );

  const handleCategoryChange = useCallback(
    (categoryId: GoalCalculatorCategoryEnum) => {
      const category = categories.find((cat) => cat.id === categoryId);
      if (category) {
        setSelectedCategoryID(categoryId);
        setSelectedStepID(category.steps[0].id);
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
        setSelectedStepID(stepId);
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
      (step) => step.id === selectedStepID,
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
      setSelectedStepID(currentCategory.steps[nextStepIndex].id);
    } else {
      // If no next step, check to find the next category
      const nextCategoryIndex =
        categories.findIndex((cat) => cat.id === selectedCategoryID) + 1;
      const nextCategory = categories[nextCategoryIndex];
      if (nextCategory) {
        setSelectedCategoryID(nextCategory.id);
        setSelectedStepID(nextCategory.steps[0].id);
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
    selectedCategoryID,
    selectedStepID,
    t,
  ]);

  const contextValue: GoalCalculatorType = useMemo(
    () => ({
      categories,
      selectedCategoryID,
      selectedStepID,
      currentCategory,
      currentStep,
      handleCategoryChange,
      handleStepChange,
      handleContinue,
    }),
    [
      categories,
      selectedCategoryID,
      selectedStepID,
      currentCategory,
      currentStep,
      handleCategoryChange,
      handleStepChange,
      handleContinue,
    ],
  );

  return (
    <GoalCalculatorContext.Provider value={contextValue}>
      {children}
    </GoalCalculatorContext.Provider>
  );
};
