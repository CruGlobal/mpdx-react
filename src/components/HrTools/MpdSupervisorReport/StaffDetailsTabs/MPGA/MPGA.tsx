import React from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export const StaffTabMPGA: React.FC = () => {
  const { t } = useTranslation();

  return <Typography>{t('MPGA')}</Typography>;
};
