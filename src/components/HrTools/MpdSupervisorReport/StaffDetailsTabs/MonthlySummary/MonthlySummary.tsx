import React from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export const StaffTabMonthlySummary: React.FC = () => {
  const { t } = useTranslation();

  return <Typography>{t('Monthly Summary')}</Typography>;
};
