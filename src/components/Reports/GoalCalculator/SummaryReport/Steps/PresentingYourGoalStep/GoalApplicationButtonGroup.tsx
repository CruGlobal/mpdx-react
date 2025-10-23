import React, { useState } from 'react';
import { Button, CircularProgress, Stack } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useUpdateAccountPreferencesMutation } from 'src/components/Settings/preferences/accordions/UpdateAccountPreferences.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { useGoalCalculator } from '../../../Shared/GoalCalculatorContext';

export const GoalApplicationButtonGroup: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { enqueueSnackbar } = useSnackbar();
  const {
    goalCalculationResult,
    goalTotals: { overallTotal },
  } = useGoalCalculator();
  const monthlyGoal = Math.round(overallTotal);
  const [updateAccountPreferences, { loading }] =
    useUpdateAccountPreferencesMutation();
  const accountListId = useAccountListId() || '';
  const [buttonsHidden, setButtonsHidden] = useState(false);

  const onSave = async () => {
    await updateAccountPreferences({
      variables: {
        input: {
          id: accountListId,
          attributes: {
            id: accountListId,
            settings: { monthlyGoal },
          },
        },
      },
      onCompleted: () => {
        enqueueSnackbar(
          t('Successfully updated your monthly goal to {{formattedTotal}}!', {
            formattedTotal: currencyFormat(monthlyGoal, 'USD', locale),
          }),
          {
            variant: 'success',
          },
        );
      },
    });
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
        onClick={() => {
          onSave();
          setButtonsHidden(true);
        }}
        disabled={goalCalculationResult.loading || loading}
        startIcon={loading ? <CircularProgress size={20} /> : undefined}
      >
        {loading ? t('Saving...') : t('Finish & Apply Goal')}
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
