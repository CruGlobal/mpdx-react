import React from 'react';
import { useTranslation } from 'react-i18next';
import { SectionList } from '../../GoalCalculator/SharedComponents/SectionList';
import { usePdsGoalCalculator } from '../Shared/PdsGoalCalculatorContext';
import {
  isAnnualReimbursableComplete,
  isMonthlyReimbursableComplete,
} from '../Shared/pdsCompletion';

export const ReimbursableExpensesSectionList: React.FC = () => {
  const { t } = useTranslation();
  const { calculation } = usePdsGoalCalculator();

  return (
    <SectionList
      sections={[
        {
          title: t('Monthly Reimbursable Expenses'),
          complete: isMonthlyReimbursableComplete(calculation),
        },
        {
          title: t('Annual Reimbursable Expenses'),
          complete: isAnnualReimbursableComplete(calculation),
        },
      ]}
    />
  );
};
