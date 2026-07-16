import React from 'react';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Alert, Box, Stack, Typography } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import { NewStaffQuestionnaireMaritalStatusEnum } from 'src/graphql/types.generated';
import { NsGoalCalculation } from '../Shared/NsGoalCalculatorContext';
import { AccountBalanceCard } from './AccountBalanceCard';
import { GoalSummaryCard } from './GoalSummaryCard';
import { MonthlyNeedsCard } from './MonthlyNeedsCard';
import { SpecialNeedsCard } from './SpecialNeedsCard';

interface ReviewYourCalculationContentProps {
  goalCalculation: NsGoalCalculation;
  /** Optional trailing content, e.g. the staff wizard's Continue button. */
  footer?: React.ReactNode;
}

/**
 * The MPD-goal calculation review UI, without any data loading. Shared by the
 * staff wizard's Review step and the coaching Goal Settings view so the two
 * reviews never drift.
 */
export const ReviewYourCalculationContent: React.FC<
  ReviewYourCalculationContentProps
> = ({ goalCalculation, footer }) => {
  const { t } = useTranslation();

  const married =
    goalCalculation.maritalStatus ===
    NewStaffQuestionnaireMaritalStatusEnum.Married;
  const columnLabel =
    married && goalCalculation.spouseFirstName
      ? t('{{firstName}} & {{spouseFirstName}}', {
          firstName: goalCalculation.firstName,
          spouseFirstName: goalCalculation.spouseFirstName,
        })
      : (goalCalculation.firstName ?? '');

  return (
    <Stack spacing={3}>
      <Typography variant="h6">{t('Review Your Calculation')}</Typography>

      <Typography variant="body1">
        <Trans t={t}>
          Please review your MPD Goal Calculation and contact your coach if you
          have questions. If everything looks good, continue to “Presenting your
          Goal”.
        </Trans>
      </Typography>

      <GoalSummaryCard
        monthlyGoal={goalCalculation.calculations.monthlyGoal}
        // TODO(MPDX-9801): special needs are not available yet; pass null so
        // the summary shows "Coming soon" rather than a fabricated figure.
        specialNeedsGoal={null}
        minStaffAccountBalance={
          goalCalculation.calculations.minimumAccountBalance
        }
        supportRaised={goalCalculation.calculations.supportRaised ?? null}
        accountBalance={goalCalculation.calculations.accountBalance ?? null}
      />

      <MonthlyNeedsCard
        calculations={goalCalculation.calculations}
        columnLabel={columnLabel}
      />

      <SpecialNeedsCard
        columnLabel={columnLabel}
        adminRate={goalCalculation.calculations.adminRate}
      />

      <AccountBalanceCard
        minAccountBalance={goalCalculation.calculations.minimumAccountBalance}
        columnLabel={columnLabel}
      />

      <Alert severity="info" icon={<InfoOutlinedIcon />}>
        <Typography variant="body1" fontWeight="bold">
          {t(
            'In order to report to your assignment, new staff must do the following:',
          )}
        </Typography>
        <Box component="ol" sx={{ my: 1, pl: 3 }}>
          <li>
            {t(
              'Call MPD Coach to verify support goal has been raised (monthly and special gifts).',
            )}
          </li>
          <li>{t('First checks have been collected.')}</li>
        </Box>
      </Alert>

      {footer}
    </Stack>
  );
};
