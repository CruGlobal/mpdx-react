import React from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';
import { Info } from 'luxon';

interface AnniversaryProps {
  marital_status: string;
  anniversary_day: number;
  anniversary_month: number;
  anniversary_year: number;
}

export const PersPrefAnniversary: React.FC<AnniversaryProps> = ({
  marital_status,
  anniversary_day,
  anniversary_month,
  anniversary_year,
}) => {
  const { t } = useTranslation();
  const anniversary = Boolean(
    anniversary_month || anniversary_day || anniversary_year,
  );

  // Status string
  let statusOutput = marital_status
    ? marital_status
    : anniversary
    ? t('Anniversary')
    : '';
  statusOutput += anniversary ? ': ' : '';

  // Anniversary string
  let dateOutput = '';
  if (anniversary) {
    // Month
    dateOutput += anniversary_month
      ? Info.monthsFormat('short')[anniversary_month] + ' '
      : '';

    // Day
    dateOutput += anniversary_day ? anniversary_day : '';

    // Spacer before year
    dateOutput +=
      anniversary_month && anniversary_day && anniversary_year ? ', ' : ' ';

    // Year
    dateOutput += anniversary_year ? anniversary_year : '';
  }

  if (marital_status || anniversary) {
    return (
      <Typography>
        {statusOutput}
        {dateOutput}
      </Typography>
    );
  }

  return null;
};
