import React from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useEffectivePaycheckDate } from './useEffectivePaycheckDate';

export const EffectiveDateNote: React.FC = () => {
  const { t } = useTranslation();
  const paycheckDate = useEffectivePaycheckDate();

  if (!paycheckDate) {
    return null;
  }

  return (
    <Typography
      variant="body2"
      color="textSecondary"
      role="note"
      component="span"
    >
      {t('Values shown reflect the paycheck dated {{date}}.', {
        date: paycheckDate,
        interpolation: { escapeValue: false },
      })}
    </Typography>
  );
};
