import React, { useCallback, useMemo, useState } from 'react';
import { useSnackbar } from 'notistack';
import { CalculatorSettings } from '../CalculatorSettings/CalculatorSettings';
import {
  GoalCalculatorCategoryEnum,
  GoalCalculatorCategoryReturn,
  GoalCalculatorCategoryStep,
  GoalCalculatorStepEnum,
} from '../GoalCalculatorHelper';
import { HouseholdExpenses } from '../HouseholdExpenses/HouseholdExpenses';
import { MinistryExpenses } from '../MinistryExpenses/MinistryExpenses';
import { SummaryReport } from '../SummaryReport/SummaryReport';

export type GoalCalculatorType = {
  categories: GoalCalculatorCategoryReturn[];
  selectedCategoryID: GoalCalculatorCategoryEnum;
  selectedStepID: GoalCalculatorStepEnum;
  currentCategory?: GoalCalculatorCategoryReturn;
  currentStep?: GoalCalculatorCategoryStep;
  handleCategoryChange: (categoryId: GoalCalculatorCategoryEnum) => void;
  handleStepChange: (stepId: GoalCalculatorStepEnum) => void;
};

export const GoalCalculatorContext =
  React.createContext<GoalCalculatorType | null>(null);

interface Props {
  children?: React.ReactNode;
}

export const GoalCalculatorProvider: React.FC<Props> = ({ children }) => {
  const { enqueueSnackbar } = useSnackbar();

  const categories = useMemo(
    () => [
      CalculatorSettings(),
      HouseholdExpenses(),
      MinistryExpenses(),
      SummaryReport(),
    ],
    [],
  );

  const [selectedCategoryID, setSelectedCategoryID] =
    useState<GoalCalculatorCategoryEnum>(
      GoalCalculatorCategoryEnum.CalculatorSettings,
    );
  const [selectedStepID, setSelectedStepID] = useState<GoalCalculatorStepEnum>(
    GoalCalculatorStepEnum.Settings,
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
        enqueueSnackbar('The selected category does not exist.', {
          variant: 'error',
        });
      }
    },
    [categories, setSelectedCategoryID, setSelectedStepID],
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
          'The selected step does not exist in the current category.',
          {
            variant: 'error',
          },
        );
      }
    },
    [categories, currentCategory, enqueueSnackbar, setSelectedStepID],
  );

  const contextValue = useMemo(
    () => ({
      categories,
      selectedCategoryID,
      selectedStepID,
      currentCategory,
      currentStep,
      handleCategoryChange,
      handleStepChange,
    }),
    [categories, selectedCategoryID, selectedStepID],
  );

  return (
    <GoalCalculatorContext.Provider value={contextValue}>
      {children}
    </GoalCalculatorContext.Provider>
  );
};
