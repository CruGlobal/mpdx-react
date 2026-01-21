import React from 'react';
import { Close, RequestPageSharp } from '@mui/icons-material';
import { Box, Container, IconButton, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import theme from 'src/theme';
import { useMinisterHousingAllowance } from '../Shared/Context/MinisterHousingAllowanceContext';

export const ExpensesClaim: React.FC = () => {
  const { t } = useTranslation();
  const { setIsRightPanelOpen } = useMinisterHousingAllowance();

  return (
    <Container sx={{ padding: 2 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h6">
          {t('What expenses can I claim on my MHA?')}
        </Typography>
        <IconButton onClick={() => setIsRightPanelOpen(false)}>
          <Close />
        </IconButton>
      </Box>

      <Box mt={4}>
        <Box display="flex" alignItems="center" gap={1}>
          <RequestPageSharp sx={{ color: theme.palette.orange.main }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {t('Allowable Expenses for MHA')}
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};
