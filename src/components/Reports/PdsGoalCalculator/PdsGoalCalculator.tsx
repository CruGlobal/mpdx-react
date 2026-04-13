import React from 'react';
import { SectionList } from 'src/components/Reports/GoalCalculator/SharedComponents/SectionList';
import { DirectionButtons } from 'src/components/Reports/Shared/CalculationReports/DirectionButtons/DirectionButtons';
import { PdsGoalCalculatorStepEnum } from './PdsGoalCalculatorHelper';
import { ReimbursableExpensesStep } from './ReimbursableExpenses/ReimbursableExpensesStep';
import { SalaryStep } from './Salary/SalaryStep';
import { SetupStep } from './Setup/SetupStep';
import { usePdsGoalCalculator } from './Shared/PdsGoalCalculatorContext';
import { PdsGoalCalculatorLayout } from './Shared/PdsGoalCalculatorLayout';
import { SummaryReportStep } from './SummaryReport/SummaryReportStep';

const CurrentStep: React.FC = () => {
  const { currentStep } = usePdsGoalCalculator();

  switch (currentStep.step) {
    case PdsGoalCalculatorStepEnum.Setup:
      return <SetupStep />;
    case PdsGoalCalculatorStepEnum.ReimbursableExpenses:
      return <ReimbursableExpensesStep />;
    case PdsGoalCalculatorStepEnum.Salary:
      return <SalaryStep />;
    case PdsGoalCalculatorStepEnum.SummaryReport:
      return <SummaryReportStep />;
  }
};

export const PdsGoalCalculator: React.FC = () => {
  const { currentStep, stepIndex, steps, handleContinue, handlePreviousStep } =
    usePdsGoalCalculator();
  const sections = currentStep.sections;

  const isLastStep = stepIndex === steps.length - 1;

  return (
    <PdsGoalCalculatorLayout
      sectionListPanel={<SectionList sections={sections} />}
      mainContent={
        <>
          <CurrentStep />
          {!isLastStep && (
            <DirectionButtons
              formTitle={currentStep.title}
              handleNextStep={handleContinue}
              handlePreviousStep={handlePreviousStep}
            />
          )}
        </>
      }
    />
  );
};
