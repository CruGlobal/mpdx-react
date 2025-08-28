import React from 'react';
import { SettingsStep } from './CalculatorSettings/SettingsStep';
import { GoalCalculatorStepEnum } from './GoalCalculatorHelper';
import { HouseholdExpensesStep } from './HouseholdExpenses/HouseholdExpensesStep';
import { MinistryExpensesStep } from './MinistryExpenses/MinistryExpensesStep';
import { useGoalCalculator } from './Shared/GoalCalculatorContext';
import { ReportsStep } from './SummaryReport/ReportsStep';

export const GoalCalculator: React.FC = () => {
  const { currentStep } = useGoalCalculator();

  switch (currentStep.step) {
    case GoalCalculatorStepEnum.CalculatorSettings:
      return <SettingsStep />;
    case GoalCalculatorStepEnum.HouseholdExpenses:
      return <HouseholdExpensesStep />;
    case GoalCalculatorStepEnum.MinistryExpenses:
      return <MinistryExpensesStep />;
    case GoalCalculatorStepEnum.SummaryReport:
      return <ReportsStep />;
  }
};
