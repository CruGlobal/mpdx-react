import React from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PdsGoalCalculatorLayout } from '../Shared/PdsGoalCalculatorLayout';

export const SalaryStep: React.FC = () => {
  const { t } = useTranslation();

  return (
    <PdsGoalCalculatorLayout
      sectionListPanel={
        <Typography variant="body2">{t('Salary')}</Typography>
      }
      mainContent={
        <Typography variant="h5" p={3}>
          {t('Salary')}
        </Typography>
      }
    />
  );
};
