import React from 'react';
import { DirectionButtons } from 'src/components/HrTools/Shared/CalculationReports/DirectionButtons/DirectionButtons';
import {
  AutosaveForm,
  useAutosaveForm,
} from 'src/components/Shared/Autosave/AutosaveForm';
import { SectionList } from '../GoalCalculator/SharedComponents/SectionList';
import { PdsGoalCalculatorStepEnum } from './PdsGoalCalculatorHelper';
import { ReimbursableExpensesStep } from './ReimbursableExpenses/ReimbursableExpensesStep';
import { SetupStep } from './Setup/SetupStep';
import { usePdsGoalCalculator } from './Shared/PdsGoalCalculatorContext';
import { PdsGoalCalculatorLayout } from './Shared/PdsGoalCalculatorLayout';
import { SummaryReportStep } from './SummaryReport/SummaryReportStep';
import { SupportItemStep } from './SupportItem/SupportItemStep';

const CurrentStep: React.FC = () => {
  const { currentStep } = usePdsGoalCalculator();

  switch (currentStep.step) {
    case PdsGoalCalculatorStepEnum.Setup:
      return <SetupStep />;
    case PdsGoalCalculatorStepEnum.ReimbursableExpenses:
      return <ReimbursableExpensesStep />;
    case PdsGoalCalculatorStepEnum.SupportItem:
      return <SupportItemStep />;
    case PdsGoalCalculatorStepEnum.SummaryReport:
      return <SummaryReportStep />;
  }
};

const MainContent: React.FC = () => {
  const { currentStep, stepIndex, steps, handleContinue, handlePreviousStep } =
    usePdsGoalCalculator();
  const { allValid } = useAutosaveForm();

  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === steps.length - 1;

  return (
    <>
      <CurrentStep />
      {!isLastStep && (
        <DirectionButtons
          formTitle={currentStep.title}
          handleNextStep={handleContinue}
          handlePreviousStep={handlePreviousStep}
          showBackButton={!isFirstStep}
          disableNext={!allValid}
        />
      )}
    </>
  );
};

export const PdsGoalCalculator: React.FC = () => {
  const { currentStep } = usePdsGoalCalculator();
  const sections = currentStep.sections;

  return (
    <PdsGoalCalculatorLayout
      sectionListPanel={<SectionList sections={sections} />}
      mainContent={
        <AutosaveForm>
          <MainContent />
        </AutosaveForm>
      }
    />
  );
};
