import React from 'react';
import { Box, Divider, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { NsoMpdQuestionnaireLayout } from '../Shared/NsoMpdQuestionnaireLayout';
import { DebtQuestions } from './DebtQuestions';
import { VariantQuestions } from './VariantQuestions';

export const FinancialInformation: React.FC = () => {
  const { t } = useTranslation();

  return (
    <NsoMpdQuestionnaireLayout>
      <Box mx={4} my={2}>
        <Stack spacing={2}>
          <Typography variant="h6">{t('Financial Information')}</Typography>
          <Typography variant="body1">
            {t('Tell us about your financial situation.')}
          </Typography>
        </Stack>
        <Divider sx={{ mx: -4, my: 4 }} />
        <Stack spacing={4}>
          <VariantQuestions />
          <DebtQuestions />
        </Stack>
      </Box>
    </NsoMpdQuestionnaireLayout>
  );
};
