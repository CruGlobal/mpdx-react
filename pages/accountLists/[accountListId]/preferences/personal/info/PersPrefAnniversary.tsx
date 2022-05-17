import React from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@material-ui/core';

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
    anniversary_month && (anniversary_day || anniversary_year),
  );

  const months = [
    t('Jan'),
    t('Feb'),
    t('Mar'),
    t('Apr'),
    t('May'),
    t('Jun'),
    t('Jul'),
    t('Aug'),
    t('Sep'),
    t('Oct'),
    t('Nov'),
    t('Dec'),
  ];

  if (marital_status || anniversary) {
    return (
      <Typography gutterBottom>
        {marital_status ? marital_status : anniversary ? t('Anniversary') : ''}
        {anniversary && (
          <>
            {`: ${months[anniversary_month]}.`}
            {anniversary_day ? ` ${anniversary_day}` : ''}
            {anniversary_day && anniversary_year ? `, ${anniversary_year}` : ''}
            {!anniversary_day && anniversary_year ? ` ${anniversary_year}` : ''}
          </>
        )}
      </Typography>
    );
  }

  return null;
};
