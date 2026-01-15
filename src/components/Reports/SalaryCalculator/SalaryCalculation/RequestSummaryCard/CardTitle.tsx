import React from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface CardTitleProps {
  invalid: boolean;
}

export const CardTitle: React.FC<CardTitleProps> = ({ invalid }) => {
  const { t } = useTranslation();

  return (
    <>
      {invalid ? (
        <WarningIcon color="warning" />
      ) : (
        <CheckCircleIcon color="success" />
      )}
      <Typography
        variant="h6"
        component="span"
        color={invalid ? 'warning.main' : 'success.main'}
        sx={{ fontWeight: 'bold' }}
      >
        {t('Request Summary')}
      </Typography>
      <Typography variant="subtitle1" component="span" color="textSecondary">
        {t('Your Gross Requested Salary')}
      </Typography>
    </>
  );
};
