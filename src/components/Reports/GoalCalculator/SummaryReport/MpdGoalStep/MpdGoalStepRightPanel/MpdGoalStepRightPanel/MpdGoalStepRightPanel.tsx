import React from 'react';
import CalculateIcon from '@mui/icons-material/Calculate';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { Box, Button, Divider, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useGoalCalculator } from 'src/components/Reports/GoalCalculator/Shared/GoalCalculatorContext';
import { MpdGoalStepRightPanelAccordions } from '../MpdGoalStepRightPanelAccordions/MpdGoalStepRightPanelAccordions';

export const MpdGoalStepRightPanel: React.FC = () => {
  const { t } = useTranslation();
  const { closeRightPanel } = useGoalCalculator();
  const theme = useTheme();

  return (
    <Box sx={{ m: theme.spacing(3) }}>
      <Typography
        data-testid="resource-title"
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
          data-testid="table-title"
          component={Typography}
          display="flex"
          alignItems="center"
          fontWeight={theme.typography.fontWeightBold}
          variant="h6"
          sx={{ mb: theme.spacing(3), gap: theme.spacing(1) }}
        >
          <CalculateIcon sx={{ color: theme.palette.secondary.main, mr: 1 }} />
          {t('MPD Goal Calculation Table')}
        </Typography>
        <MpdGoalStepRightPanelAccordions />
        <Button
          variant="outlined"
          onClick={closeRightPanel}
          sx={{ mt: theme.spacing(3) }}
        >
          {t('Close Panel')}
        </Button>
      </Box>
    </Box>
  );
};
