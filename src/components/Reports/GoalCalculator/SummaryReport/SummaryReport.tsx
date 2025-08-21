import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import Loading from 'src/components/Loading';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { GoalCalculatorReportEnum } from '../GoalCalculatorHelper';
import { useGoalCalculator } from '../Shared/GoalCalculatorContext';
import { GoalCalculatorSection } from '../Shared/GoalCalculatorSection';
import { useGoalCalculationQuery } from './GoalCalculation.generated';
import { MpdGoalHeaderCards } from './MpdGoal/MpdGoalHeaderCards/MpdGoalHeaderCards';
import { MpdGoalTable } from './MpdGoal/MpdGoalTable';
import { MpdGoalStepRightPanel } from './MpdGoalStep/MpdGoalStepRightPanel/MpdGoalStepRightPanel/MpdGoalStepRightPanel';
import { GoalApplicationButtonGroup } from './Steps/PresentingYourGoalStep/GoalApplicationButtonGroup';
import { PresentingYourGoal } from './Steps/PresentingYourGoalStep/PresentingYourGoal';
import { PresentingYourGoalStepRightPanel } from './Steps/PresentingYourGoalStepRightPanelComponent/PresentingYourGoalStepRightPanel';
import { getPrimaryCategoryTotal, getSubcategoryTotal } from './helpers';

export const SummaryReport: React.FC = () => {
  const { t } = useTranslation();
  const { selectedReport } = useGoalCalculator();
  const theme = useTheme();

  const accountListId = useAccountListId() ?? '';
  const goalCalculationId = 'aaea272a-3f02-47da-9304-86bd408eb11d';

  const { data: goalData, loading } = useGoalCalculationQuery({
    variables: {
      accountListId,
      goalCalculationId,
    },
  });

  const goal = useMemo(() => {
    if (!goalData?.goalCalculation) {
      return null;
    }
    const ministryFamily = goalData.goalCalculation.ministryFamily;
    return {
      netMonthlySalary: 8774.25,
      taxesPercentage: 0.17,
      rothContributionPercentage: 0.04,
      traditionalContributionPercentage: 0.06,
      ministryExpenses: {
        benefitsCharge: 0,
        ministryMileage: getSubcategoryTotal(
          ministryFamily,
          'MEDICAL_AND_MEDICAL_MILEAGE',
          'MINISTRY_MILEAGE',
        ),
        medicalMileage: getSubcategoryTotal(
          ministryFamily,
          'MINISTRY_AND_MEDICAL_MILEAGE',
          'MEDICAL_MILEAGE',
        ),

        medicalExpenses: getPrimaryCategoryTotal(ministryFamily, 'MEDICAL'),
        ministryPartnerDevelopment: getPrimaryCategoryTotal(
          ministryFamily,
          'MINISTRY_PARTNER_DEVELOPMENT',
        ),
        communications: getPrimaryCategoryTotal(
          ministryFamily,
          'OPERATIONS_COMMUNICATIONS',
        ),
        entertainment: getPrimaryCategoryTotal(ministryFamily, 'RECREATION'),
        staffDevelopment: getPrimaryCategoryTotal(
          ministryFamily,
          'MINISTRY_PARTNER_DEVELOPMENT',
        ),
        supplies: getPrimaryCategoryTotal(
          ministryFamily,
          'SUPPLIES_AND_MATERIALS',
        ),
        technology:
          getPrimaryCategoryTotal(
            ministryFamily,
            'INTERNET_SERVICE_PROVIDER_FEE',
          ) + getPrimaryCategoryTotal(ministryFamily, 'CELL_PHONE_WORK_LINE'),
        travel:
          getPrimaryCategoryTotal(ministryFamily, 'MINISTRY_TRAVEL') +
          getPrimaryCategoryTotal(ministryFamily, 'SUMMER_ASSIGNMENT_TRAVEL'),
        transfers: getPrimaryCategoryTotal(ministryFamily, 'ACCOUNT_TRANSFERS'),
        other: getPrimaryCategoryTotal(ministryFamily, 'MINISTRY_OTHER'),
      },
    };
  }, [goalData]);

  if (loading || !goal) {
    return <Loading loading />;
  }

  if (selectedReport === GoalCalculatorReportEnum.MpdGoal) {
    return (
      <GoalCalculatorSection
        title={t('MPD Goal')}
        rightPanelContent={<MpdGoalStepRightPanel />}
        printable
      >
        <Box mb={theme.spacing(4)}>
          <MpdGoalHeaderCards goal={goal} />
        </Box>
        <MpdGoalTable goal={goal} />
      </GoalCalculatorSection>
    );
  } else if (selectedReport === GoalCalculatorReportEnum.PresentingYourGoal) {
    return (
      <GoalCalculatorSection
        title={t('Presenting Your Goal')}
        rightPanelContent={<PresentingYourGoalStepRightPanel />}
        printable
      >
        <PresentingYourGoal />
        <GoalApplicationButtonGroup goal={goal} />
      </GoalCalculatorSection>
    );
  }

  return null;
};
