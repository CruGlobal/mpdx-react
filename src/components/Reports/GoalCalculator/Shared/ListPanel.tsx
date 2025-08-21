import React from 'react';
import { useCalculatorSettings } from '../CalculatorSettings/CalculatorSettings';
import { GoalCalculatorStepEnum } from '../GoalCalculatorHelper';
import {
  ReportSectionList,
  SectionList,
} from '../SharedComponents/SectionList';
import { useGoalCalculator } from './GoalCalculatorContext';
import { getFamilySections } from './familySections';

interface ListPanelProps {
  step: GoalCalculatorStepEnum;
}

export const ListPanel: React.FC<ListPanelProps> = ({ step }) => {
  const { goalCalculationResult } = useGoalCalculator();
  const calculatorSettings = useCalculatorSettings();
  const { data } = goalCalculationResult;

  if (!data) {
    return null;
  }

  if (step === GoalCalculatorStepEnum.CalculatorSettings) {
    return (
      <SectionList
        sections={
          calculatorSettings.categories.map((category) => ({
            title: category.title,
            complete: false,
          })) ?? []
        }
      />
    );
  } else if (step === GoalCalculatorStepEnum.MinistryExpenses) {
    return (
      <SectionList
        sections={getFamilySections(data.goalCalculation.ministryFamily)}
      />
    );
  } else if (step === GoalCalculatorStepEnum.HouseholdExpenses) {
    return (
      <SectionList
        sections={getFamilySections(data.goalCalculation.householdFamily)}
      />
    );
  } else if (step === GoalCalculatorStepEnum.SummaryReport) {
    return <ReportSectionList />;
  }

  return null;
};
