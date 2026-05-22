import NextLink from 'next/link';
import React from 'react';
import { Link, Typography, styled } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useGoalCalculator } from '../Shared/GoalCalculatorContext';
import { ExpensesStep } from '../SharedComponents/ExpensesStep/ExpensesStep';

const InstructionsWrapper = styled('div')(({ theme }) => ({
  '.MuiTypography-root': {
    marginBottom: theme.spacing(1),
  },
}));

const Instructions: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId() ?? '';

  return (
    <InstructionsWrapper>
      <Typography variant="body2">
        <Trans t={t}>
          Enter amounts for the following categories of reimbursable and
          ministry expenses. The{' '}
          <Link
            component={NextLink}
            href={`/accountLists/${accountListId}/reports/mpgaIncomeExpenses`}
          >
            MPGA tool
          </Link>{' '}
          can show you your averages in some of these categories. If you did not
          take full reimbursements for the entire year, or if your
          reimbursements were abnormally high (e.g. you had a surgery or bought
          a new computer), or low (e.g. no summer mission), you will want to
          adjust the averages from the MPGA to reflect an average year. Click
          the link above and look at the Ministry rows in the Expenses table.
        </Trans>
      </Typography>
    </InstructionsWrapper>
  );
};

export const MinistryExpensesStep: React.FC = () => {
  const { goalCalculationResult } = useGoalCalculator();
  const { data } = goalCalculationResult;

  return (
    <ExpensesStep
      instructions={<Instructions />}
      family={data?.goalCalculation.ministryFamily}
    />
  );
};
