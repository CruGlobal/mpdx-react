import React from 'react';
import { GoalCalculatorStepEnum } from './GoalCalculatorHelper';
import { useGoalCalculator } from './Shared/GoalCalculatorContext';
import { HouseholdExpensesStep } from './Steps/HouseholdExpensesStep/HouseholdExpensesStep';
import { MinistryExpensesStep } from './Steps/MinistryExpensesStep/MinistryExpensesStep';
import { ReportsStep } from './Steps/ReportsStep/ReportsStep';
import { SettingsStep } from './Steps/SettingsStep/SettingsStep';

export const GoalCalculator: React.FC = () => {
  const { currentStep } = useGoalCalculator();

  switch (currentStep.id) {
    case GoalCalculatorStepEnum.CalculatorSettings:
      return <SettingsStep />;
    case GoalCalculatorStepEnum.HouseholdExpenses:
      return <HouseholdExpensesStep />;
    case GoalCalculatorStepEnum.MinistryExpenses:
      return <MinistryExpensesStep />;
    case GoalCalculatorStepEnum.SummaryReport:
      return <ReportsStep />;
  }

  return null;
};
