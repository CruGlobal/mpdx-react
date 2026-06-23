import React from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export const StaffTabStaffExpenseReport: React.FC = () => {
  const { t } = useTranslation();

  return <Typography>{t('Staff Expense Report')}</Typography>;
};
