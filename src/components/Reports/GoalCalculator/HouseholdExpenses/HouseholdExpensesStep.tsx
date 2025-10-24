import React from 'react';
import { Link, Typography, styled } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
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
      <Typography variant="body2" component="div">
        <Trans t={t}>
          Your initial monthly budget amount is based on you and your
          spouse&apos;s net paycheck amounts and any sources of additional
          income.
          <ul>
            <li>
              If you don&apos;t need to change your monthly budget, you may
              choose to skip entering budget categories and continue to the next
              step.
            </li>
            <li>
              If you know what your new monthly budget should be, click
              &quot;Override Paycheck Amount&quot; and enter it. You may choose
              to skip entering budget categories and continue to the next step.
            </li>
            <li>
              If you don&apos;t know what your monthly budget should be, fill
              out the budget categories and click &quot;Use Categories
              Total&quot;.
            </li>
          </ul>
          For additional guidance, check out{' '}
          <Link href="https://www.ramseysolutions.com/budgeting/useful-forms">
            these resources from Ramsey Solutions
          </Link>
          .
        </Trans>
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
          <HouseholdExpensesHeader />
        </>
      }
      family={data?.goalCalculation.householdFamily}
    />
  );
};
