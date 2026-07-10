import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Alert, Box, Button, Stack, Typography } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import { NewStaffQuestionnaireMaritalStatusEnum } from 'src/graphql/types.generated';
import {
  NsGoalCalculation,
  useNsGoalCalculator,
} from '../Shared/NsGoalCalculatorContext';
import { AccountBalanceCard } from './AccountBalanceCard';
import { GoalSummaryCard } from './GoalSummaryCard';
import { MonthlyNeedsCard } from './MonthlyNeedsCard';
import { SpecialNeedsCard } from './SpecialNeedsCard';

interface ReviewYourCalculationStepProps {
  goalCalculation: NsGoalCalculation;
}

export const ReviewYourCalculationStep: React.FC<
  ReviewYourCalculationStepProps
> = ({ goalCalculation }) => {
  const { t } = useTranslation();
  const { handleContinue } = useNsGoalCalculator();

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

      <Button
        variant="contained"
        onClick={handleContinue}
        sx={{ alignSelf: 'flex-start' }}
      >
        {t('Continue')}
      </Button>
    </Stack>
  );
};
