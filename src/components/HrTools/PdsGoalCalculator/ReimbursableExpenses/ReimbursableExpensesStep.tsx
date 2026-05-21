import React from 'react';
import { Box, Divider, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AnnualReimbursableSection } from './AnnualReimbursableSection';
import { MonthlyReimbursableSection } from './MonthlyReimbursableSection';
import { TotalReimbursableSection } from './TotalReimbursableSection';

export const ReimbursableExpensesStep: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <Box pb={4}>
        <Typography variant="h6" component="h2">
          {t('Reimbursable Expenses')}
        </Typography>
        <Typography pt={1}>
          {t(
            'Enter the ministry expenses you are reimbursed for each year. Monthly entries are used as-is and annual entries are divided by 12; the combined total is included in your support goal.',
          )}
        </Typography>
      </Box>
      <Divider sx={{ mx: -4, my: 4 }} />
      <MonthlyReimbursableSection />
      <Divider sx={{ mx: -4, my: 4 }} />
      <AnnualReimbursableSection />
      <Divider sx={{ mx: -4, my: 4 }} />
      <TotalReimbursableSection />
      <Divider sx={{ mx: -4, my: 4 }} />
    </>
  );
};
