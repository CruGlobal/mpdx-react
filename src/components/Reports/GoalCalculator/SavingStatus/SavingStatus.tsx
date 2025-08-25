import { useMemo } from 'react';
import { CircularProgress, Typography } from '@mui/material';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { formatRelativeTime } from 'src/lib/intlFormat';
import { useGoalCalculator } from '../Shared/GoalCalculatorContext';
import { getGoalLastUpdated } from './helpers';

export const SavingStatus: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { goalCalculationResult, isMutating } = useGoalCalculator();

  const goalCalculation = goalCalculationResult.data?.goalCalculation;
  const lastSavedAt = useMemo(
    () => (goalCalculation ? getGoalLastUpdated(goalCalculation) : null),
    [goalCalculation],
  );

  if (!lastSavedAt) {
    return null;
  }

  if (isMutating) {
    return (
      <Typography variant="body1" color="textSecondary">
        {t('Saving')}
        <CircularProgress size="1rem" sx={{ ml: 1 }} />
      </Typography>
    );
  }

  const diff =
    DateTime.fromISO(lastSavedAt).toMillis() - DateTime.now().toMillis();
  return (
    <Typography variant="body1" color="textSecondary">
      {t('Last saved {{when}}', { when: formatRelativeTime(diff, locale) })}
    </Typography>
  );
};
