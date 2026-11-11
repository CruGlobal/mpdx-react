import React, { useId, useMemo } from 'react';
import { Skeleton, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useLocale } from 'src/hooks/useLocale';
import { getAppName } from 'src/lib/getAppName';
import { currencyFormat } from 'src/lib/intlFormat';
import {
  StyledCard,
  StyledHeaderValue,
} from '../../../Shared/SummaryHeaderCard';
import { missingValue } from '../../../Shared/helpers/missingValue';
import { useGoalCalculator } from '../../Shared/GoalCalculatorContext';
import { calculateNewStaffReferenceTotals } from '../../Shared/calculateNewStaffReference';
import { useCurrentMonthlyGoalQuery } from './CurrentMonthlyGoal.generated';

interface ReferenceCardProps {
  title: string;
  caption: string;
  /** The formatted value, or undefined while it loads (a failed load shows missingValue) */
  value: string | undefined;
}

const ReferenceCard: React.FC<ReferenceCardProps> = ({
  title,
  caption,
  value,
}) => {
  const titleId = useId();

  return (
    <StyledCard role="region" aria-labelledby={titleId}>
      <Typography id={titleId} variant="h5" whiteSpace="normal">
        {title}
      </Typography>
      <StyledHeaderValue variant="h2" component="p">
        {value ?? <Skeleton width={160} />}
      </StyledHeaderValue>
      <Typography variant="body2" color="text.secondary" whiteSpace="normal">
        {caption}
      </Typography>
    </StyledCard>
  );
};

export const GoalReferenceCards: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const accountListId = useAccountListId();
  const { goalCalculationResult } = useGoalCalculator();
  const { data: currentGoalData, error: currentGoalError } =
    useCurrentMonthlyGoalQuery({
      variables: { accountListId },
    });

  const formatGoal = (amount: number) =>
    currencyFormat(amount, 'USD', locale, { fractionDigits: 0 });

  const goalCalculation = goalCalculationResult.data?.goalCalculation;
  const newStaffReferenceGoal = useMemo(
    () => calculateNewStaffReferenceTotals(goalCalculation).overallTotal,
    [goalCalculation],
  );

  const formatCurrentGoal = (): string | undefined => {
    if (currentGoalError) {
      return missingValue;
    }
    if (!currentGoalData) {
      return undefined;
    }
    const monthlyGoal = currentGoalData.accountList.settings?.monthlyGoal;
    // A goal of 0 is not a real goal, so treat it like a blank one
    return monthlyGoal ? formatGoal(monthlyGoal) : t('Not set');
  };

  const formatReferenceGoal = (): string | undefined => {
    if (goalCalculation) {
      return formatGoal(newStaffReferenceGoal);
    }
    return goalCalculationResult.error ? missingValue : undefined;
  };

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} gap={{ xs: 2, sm: 4 }}>
      <ReferenceCard
        title={t('Current Monthly Goal')}
        caption={t('From your {{appName}} settings', {
          appName: getAppName(),
        })}
        value={formatCurrentGoal()}
      />
      <ReferenceCard
        title={t('New Staff Reference Goal')}
        caption={t('Based on the information in this goal')}
        value={formatReferenceGoal()}
      />
    </Stack>
  );
};
