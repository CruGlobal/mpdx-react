import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useGoalCalculator } from 'src/components/Reports/GoalCalculator/Shared/GoalCalculatorContext';

export const MileageStepRightPanelComponent: React.FC = () => {
  const { t } = useTranslation();
  const { closeRightPanel } = useGoalCalculator();

  return (
    <Box sx={{ padding: '16px' }}>
      <Typography variant="h6" gutterBottom>
        {t('Mileage Step')}
      </Typography>

      <Button
        variant="outlined"
        onClick={closeRightPanel}
        sx={{ marginTop: '16px' }}
      >
        {t('Close Panel')}
      </Button>
    </Box>
  );
};
