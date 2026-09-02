import React from 'react';
import { Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { dateFormatShort, timeFormat } from 'src/lib/intlFormat';
import { useMpdGoalAdmin } from '../MpdGoalAdminContext';

/**
 * Confirms the cohort's most recent Run & Send batch. Absent until the first
 * send, so its absence is itself meaningful — don't render a placeholder.
 */
export const GoalsSentBanner: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { selectedCohort } = useMpdGoalAdmin();
  const goalsSentAt = selectedCohort?.goalsSentAt;

  if (!goalsSentAt) {
    return null;
  }

  return (
    <Alert severity="success" role="status" sx={{ mb: 2 }}>
      {t('Goals were last run and sent on {{date}} at {{time}}.', {
        date: dateFormatShort(goalsSentAt, locale),
        time: timeFormat(goalsSentAt, locale),
      })}
    </Alert>
  );
};
