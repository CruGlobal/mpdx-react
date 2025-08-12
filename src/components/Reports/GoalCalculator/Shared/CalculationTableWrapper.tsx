import React from 'react';
import CalculateIcon from '@mui/icons-material/Calculate';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { Box, Divider, Typography, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface CalculationTableWrapperProps {
  label: string;
  children: React.ReactNode;
}

export const CalculationTableWrapper: React.FC<
  CalculationTableWrapperProps
> = ({ label, children }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Box sx={{ m: theme.spacing(3) }}>
      <Typography
        display="flex"
        alignItems="center"
        variant="h6"
        sx={{ mb: theme.spacing(2) }}
      >
        <MenuBookIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
        {t('Resources')}
      </Typography>
      <Divider sx={{ mb: theme.spacing(2) }} />
      <Box sx={{ mb: theme.spacing(3) }}>
        <Typography
          display="flex"
          alignItems="center"
          fontWeight={theme.typography.fontWeightBold}
          variant="h6"
          sx={{ mb: theme.spacing(3), gap: theme.spacing(1) }}
        >
          <CalculateIcon sx={{ color: theme.palette.secondary.main, mr: 1 }} />
          {label}
        </Typography>
        {children}
      </Box>
    </Box>
  );
};
