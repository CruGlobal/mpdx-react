import React from 'react';
import { Button, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useGoalCalculator } from 'src/components/Reports/GoalCalculator/Shared/GoalCalculatorContext';

export const MileageCategoryRightPanelComponent: React.FC = () => {
  const { t } = useTranslation();
  const { closeRightPanel } = useGoalCalculator();

  return (
    <>
      <Typography variant="h6" gutterBottom>
        {t('Mileage Expenses')}
      </Typography>

      <Button
        variant="outlined"
        onClick={closeRightPanel}
        sx={{ marginTop: '16px' }}
      >
        {t('Close Panel')}
      </Button>
    </>
  );
};
