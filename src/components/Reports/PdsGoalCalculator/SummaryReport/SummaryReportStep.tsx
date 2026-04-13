import React from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export const SummaryReportStep: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Typography variant="h5" p={3}>
      {t('Summary Report')}
    </Typography>
  );
};
