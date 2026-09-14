import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DirectionButtons } from 'src/components/HrTools/Shared/CalculationReports/DirectionButtons/DirectionButtons';
import {
  AutosaveForm,
  useAutosaveForm,
} from 'src/components/Shared/Autosave/AutosaveForm';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useApplyGoalAndLocation } from 'src/hooks/useApplyGoalAndLocation';
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
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const {
    currentStep,
    stepIndex,
    steps,
    summaryData,
    handleContinue,
    handlePreviousStep,
    calculation,
  } = usePdsGoalCalculator();
  const { allValid } = useAutosaveForm();
  const geographicLocation = calculation?.geographicLocation ?? null;
  const { applyMonthlyGoal, loading: updating } =
    useApplyGoalAndLocation(geographicLocation);
  const [submitted, setSubmitted] = useState(false);

  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === steps.length - 1;

  const handleSubmitGoal = async () => {
    if (!accountListId || !summaryData?.overallTotal) {
      return;
    }
    const monthlyGoal = Math.round(summaryData.overallTotal);
    await applyMonthlyGoal(monthlyGoal, {
      refetchQueries: ['GetDashboard', 'GetDonationGraph'],
    });
    setSubmitted(true);
  };

  return (
    <>
      <CurrentStep />
      <DirectionButtons
        formTitle={currentStep.title}
        handleNextStep={handleContinue}
        handlePreviousStep={handlePreviousStep}
        showBackButton={!isFirstStep}
        buttonTitle={isLastStep ? t('Apply Goal to MPDX') : undefined}
        overrideNext={isLastStep ? handleSubmitGoal : undefined}
        disableNext={
          !allValid ||
          (isLastStep &&
            (submitted || !summaryData?.overallTotal || !accountListId))
        }
        disabledNextTooltip={
          isLastStep ? t('Complete all required fields to submit') : undefined
        }
        loadingNext={isLastStep && updating}
        loadingNextTitle={t('Saving...')}
      />
    </>
  );
};

export const PdsGoalCalculator: React.FC = () => {
  return (
    <AutosaveForm>
      <PdsGoalCalculatorLayout
        sectionListPanel={<CurrentSectionList />}
        mainContent={<MainContent />}
      />
    </AutosaveForm>
  );
};
