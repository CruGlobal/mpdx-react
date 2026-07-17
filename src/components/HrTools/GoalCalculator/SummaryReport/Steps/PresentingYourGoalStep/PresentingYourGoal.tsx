import React, { useMemo } from 'react';
import { styled } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { MonthlyNeedsCard } from 'src/components/HrTools/Shared/GoalPresentation/MonthlyNeedsCard';
import { PersonalInfoCard } from 'src/components/HrTools/Shared/GoalPresentation/PersonalInfoCard';
import { PresentationCard } from 'src/components/HrTools/Shared/GoalPresentation/PresentationCard';
import { SupportNeedsChart } from 'src/components/HrTools/Shared/GoalPresentation/SupportNeedsChart';
import { useMonthlyNeedsRows } from 'src/components/HrTools/Shared/GoalPresentation/useMonthlyNeedsRows';
import { useGoalCalculator } from '../../../Shared/GoalCalculatorContext';
import { hasStaffSpouse } from '../../../Shared/calculateTotals';

const PrintableContent = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),

  // Scale down the page to fit on one page
  '@media print': {
    zoom: 0.4,
  },
}));

interface PresentingYourGoalProps {
  supportRaised: number;
}

export const PresentingYourGoal: React.FC<PresentingYourGoalProps> = ({
  supportRaised,
}) => {
  const { t } = useTranslation();
  const {
    goalCalculationResult: { data },
    goalTotals,
  } = useGoalCalculator();
  const goalCalculation = data?.goalCalculation;
  const married = hasStaffSpouse(goalCalculation?.familySize);

  const supportNeeds = useMemo(
    () => ({
      married,
      salary: goalTotals.netMonthlySalary,
      ministryExpenses: goalTotals.ministryExpensesTotal + goalTotals.attrition,
      benefits: goalTotals.benefitsCharge,
      socialSecurityAndTaxes: goalTotals.taxes,
      voluntaryRetirement:
        goalTotals.traditionalContribution + goalTotals.rothContribution,
      adminCharge:
        goalTotals.overallSubtotalWithAdmin - goalTotals.overallSubtotal,
      monthlyGoal: goalTotals.overallTotal,
    }),
    [married, goalTotals],
  );
  const supportNeedsRows = useMonthlyNeedsRows(supportNeeds);

  return (
    <PrintableContent>
      <PersonalInfoCard
        firstName={goalCalculation?.firstName ?? ''}
        spouseFirstName={married ? goalCalculation?.spouseFirstName : null}
        lastName={goalCalculation?.lastName ?? ''}
        ministryLocation={goalCalculation?.ministryLocation ?? undefined}
      />

      <MonthlyNeedsCard
        monthlyNeeds={supportNeeds}
        supportRaised={supportRaised}
      />

      <PresentationCard
        title={t('Monthly Support Breakdown')}
        horizontalScroll={false}
      >
        <SupportNeedsChart needsCategories={supportNeedsRows} />
      </PresentationCard>
    </PrintableContent>
  );
};
