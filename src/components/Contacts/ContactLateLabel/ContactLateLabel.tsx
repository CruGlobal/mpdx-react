import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@material-ui/core';
import { DateTime, Duration } from 'luxon';
import { ContactRowFragment } from '../ContactRow/ContactRow.generated';

interface ContactLateLabelProps {
  lateAt: ContactRowFragment['lateAt'];
}

export const ContactLateLabel: React.FC<ContactLateLabelProps> = ({
  lateAt,
}) => {
  const { t } = useTranslation();

  const contactLateStatus: Duration | undefined = useMemo(() => {
    if (lateAt) {
      return DateTime.now().diff(DateTime.fromISO(lateAt), 'days')?.days;
    }
  }, [lateAt]);

  return !daysLate ? null : daysLate < 0 ? (
    <Typography component="span" color="success">
      {t('On time')}
    </Typography>
  ) : daysLate < 30 ? (
    <Typography component="span" color="textPrimary">
      {t('0-30 days late')}
    </Typography>
  ) : daysLate < 60 ? (
    <Typography component="span" color="warning">
      {t('30-60 days late')}
    </Typography>
  ) : (
    <Typography component="span" color="error">
      {t('60+ days late')}
    </Typography>
  );
};
