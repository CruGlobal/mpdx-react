import React from 'react';
import { DirectionButtons } from 'src/components/HrTools/Shared/CalculationReports/DirectionButtons/DirectionButtons';
import {
  AutosaveForm,
  useAutosaveForm,
} from 'src/components/Shared/Autosave/AutosaveForm';
import { PdsGoalCalculatorStepEnum } from './PdsGoalCalculatorHelper';
import { ReimbursableExpensesSectionList } from './ReimbursableExpenses/ReimbursableExpensesSectionList';
import { ReimbursableExpensesStep } from './ReimbursableExpenses/ReimbursableExpensesStep';
import { SetupSectionList } from './Setup/SetupSectionList';
import { SetupStep } from './Setup/SetupStep';
import { usePdsGoalCalculator } from './Shared/PdsGoalCalculatorContext';
import { PdsGoalCalculatorLayout } from './Shared/PdsGoalCalculatorLayout';
import { SummaryReportSectionList } from './SummaryReport/SummaryReportSectionList';
import { SummaryReportStep } from './SummaryReport/SummaryReportStep';
import { SupportItemSectionList } from './SupportItem/SupportItemSectionList';
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

const CurrentSectionList: React.FC = () => {
  const { currentStep } = usePdsGoalCalculator();

  switch (currentStep.step) {
    case PdsGoalCalculatorStepEnum.Setup:
      return <SetupSectionList />;
    case PdsGoalCalculatorStepEnum.ReimbursableExpenses:
      return <ReimbursableExpensesSectionList />;
    case PdsGoalCalculatorStepEnum.SupportItem:
      return <SupportItemSectionList />;
    case PdsGoalCalculatorStepEnum.SummaryReport:
      return <SummaryReportSectionList />;
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
      <DirectionButtons
        formTitle={currentStep.title}
        handleNextStep={handleContinue}
        handlePreviousStep={handlePreviousStep}
        showBackButton={!isFirstStep}
        hideNextButton={isLastStep}
        disableNext={!allValid}
      />
    </>
  );
};

export const PdsGoalCalculator: React.FC = () => {
  return (
    <PdsGoalCalculatorLayout
      sectionListPanel={<CurrentSectionList />}
      mainContent={
        <AutosaveForm>
          <MainContent />
        </AutosaveForm>
      }
    />
  );
};
