import React from 'react';
import { Typography } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import { RequestSummaryCard } from './RequestSummaryCard/RequestSummaryCard';
import { RequestedSalaryCard } from './RequestedSalaryCard/RequestedSalaryCard';

export const SalaryCalculationStep: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <Typography variant="h4">{t('Salary Calculation')}</Typography>
      <Typography variant="body1">
        <Trans t={t}>
          Please use the form below to make adjustments to your salary.
        </Trans>
      </Typography>
      <RequestedSalaryCard />
      <RequestSummaryCard />
    </>
  );
};
