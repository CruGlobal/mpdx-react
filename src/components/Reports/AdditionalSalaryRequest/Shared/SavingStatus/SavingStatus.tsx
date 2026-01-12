import { useEffect, useState } from 'react';
import { CircularProgress, Typography } from '@mui/material';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { formatRelativeTime } from 'src/lib/intlFormat';
import { useAdditionalSalaryRequest } from '../AdditionalSalaryRequestContext';

export const SavingStatus: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { requestData, isMutating } = useAdditionalSalaryRequest();

  const request = requestData?.additionalSalaryRequest;
  const lastSavedAt = request?.updatedAt;

  // Rerender periodically to update the saved at time
  const [_tick, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((tick) => tick + 1), 5000);
    return () => clearInterval(interval);
  }, []);

  if (!request) {
    return null;
  }

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
