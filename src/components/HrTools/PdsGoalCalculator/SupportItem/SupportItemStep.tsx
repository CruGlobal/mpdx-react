import React from 'react';
import { Box, Divider, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { OtherSection } from './OtherSection';
import { SalarySection } from './SalarySection';

export const SupportItemStep: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <Box pb={4}>
        <Typography variant="h6" component="h2">
          {t('Support Items')}
        </Typography>
        <Typography pt={1}>
          {t(
            'A breakdown of the items that make up your support goal, calculated from the information you entered in Setup and Reimbursable Expenses.',
          )}
        </Typography>
      </Box>
      <Divider sx={{ mx: -4, my: 4 }} />
      <SalarySection />
      <OtherSection />
      <Divider sx={{ mx: -4, my: 4 }} />
    </>
  );
};
