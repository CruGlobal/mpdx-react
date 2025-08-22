import React from 'react';
import { Link, Typography, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useGoalCalculator } from '../Shared/GoalCalculatorContext';
import { ExpensesStep } from '../SharedComponents/ExpensesStep/ExpensesStep';
import { HouseholdExpensesHeader } from './HouseholdExpensesHeader';

const InstructionsWrapper = styled('div')(({ theme }) => ({
  '.MuiTypography-root': {
    marginBottom: theme.spacing(1),
  },
}));

const Instructions: React.FC = () => {
  const { t } = useTranslation();

  return (
    <InstructionsWrapper>
      <Typography variant="h6">{t('Enter your monthly budget')}</Typography>
      <Typography variant="body2">
        {t(
          'You may choose to skip entering your budget below if you know the net cash you need each month. If you know the net cash you need each month, click "Direct Input" and enter it there. Otherwise, enter your household expenses directly below.',
        )}
      </Typography>
      <Typography variant="body2">
        {t('For additional guidance, check out')}{' '}
        <Link href="https://www.ramseysolutions.com/budgeting/useful-forms">
          {t('these resources from Ramsey Solutions')}
        </Link>
        .
      </Typography>
    </InstructionsWrapper>
  );
};

export const HouseholdExpensesStep: React.FC = () => {
  const { goalCalculationResult } = useGoalCalculator();
  const { data } = goalCalculationResult;

  return (
    <ExpensesStep
      instructions={
        <>
          <Instructions />
          <HouseholdExpensesHeader categoriesTotal={7000} />
        </>
      }
      family={data?.goalCalculation.householdFamily}
    />
  );
};
