import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Alert, Box, Button, Stack, Typography } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import { NewStaffQuestionnaireMaritalStatusEnum } from 'src/graphql/types.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useAccountListSupportRaisedQuery } from '../../GoalCalculator/Shared/GoalLineItems.generated';
import {
  NsGoalCalculation,
  useNsGoalCalculator,
} from '../Shared/NsGoalCalculatorContext';
import { AccountBalanceCard } from './AccountBalanceCard';
import { GoalSummaryCard } from './GoalSummaryCard';
import { MonthlyNeedsCard } from './MonthlyNeedsCard';
import { SpecialNeedsCard } from './SpecialNeedsCard';

// TODO(MPDX-9801): Special needs are not available yet.
const specialNeedsGoalPlaceholder = 2801;

interface ReviewYourCalculationStepProps {
  goalCalculation: NsGoalCalculation;
}

export const ReviewYourCalculationStep: React.FC<
  ReviewYourCalculationStepProps
> = ({ goalCalculation }) => {
  const { t } = useTranslation();
  const { handleContinue } = useNsGoalCalculator();
  const accountListId = useAccountListId() ?? '';
  const { data } = useAccountListSupportRaisedQuery({
    variables: { accountListId },
    skip: !accountListId,
  });
  const supportRaised = data?.accountList.receivedPledges ?? 0;

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
        specialNeedsGoal={specialNeedsGoalPlaceholder}
        minStaffAccountBalance={
          goalCalculation.calculations.minimumAccountBalance
        }
      />

      <MonthlyNeedsCard
        calculations={goalCalculation.calculations}
        supportRaised={supportRaised}
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
