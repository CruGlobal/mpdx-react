import React, { useState } from 'react';
import { Button, CircularProgress, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useApplyGoalAndLocation } from 'src/hooks/useApplyGoalAndLocation';
import { useGoalCalculator } from '../../../Shared/GoalCalculatorContext';

export const GoalApplicationButtonGroup: React.FC = () => {
  const { t } = useTranslation();
  const {
    goalCalculationResult,
    goalTotals: { overallTotal },
    constants,
  } = useGoalCalculator();
  const monthlyGoal = Math.round(overallTotal);
  const geographicLocation =
    goalCalculationResult.data?.goalCalculation?.geographicLocation ?? null;
  const { applyMonthlyGoal, loading } =
    useApplyGoalAndLocation(geographicLocation);
  const [buttonsHidden, setButtonsHidden] = useState(false);

  const onSave = async () => {
    await applyMonthlyGoal(monthlyGoal);
    setButtonsHidden(true);
  };

  if (buttonsHidden) {
    return null;
  }

  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        mt: 4,
        mb: 2,
      }}
    >
      <Button
        variant="contained"
        onClick={onSave}
        disabled={
          goalCalculationResult.loading ||
          // Without the year's constants the total would be understated, so
          // don't let the user apply it
          constants.loading ||
          constants.unavailable ||
          loading
        }
        startIcon={loading ? <CircularProgress size={20} /> : undefined}
      >
        {loading ? t('Saving...') : t('Apply Goal to MPDX')}
      </Button>
      <Button
        variant="outlined"
        color="primary"
        onClick={() => setButtonsHidden(true)}
      >
        {t('Save Goal Without Applying')}
      </Button>
    </Stack>
  );
};
