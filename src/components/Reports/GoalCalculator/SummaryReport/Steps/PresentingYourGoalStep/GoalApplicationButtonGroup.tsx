import React, { useState } from 'react';
import { Box, Button, CircularProgress } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useUpdateAccountPreferencesMutation } from 'src/components/Settings/preferences/accordions/UpdateAccountPreferences.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { Goal } from '../../MpdGoal/MpdGoalTable';
import { useGoalLineItems } from '../../MpdGoal/useGoalLineItems';

interface GoalApplicationButtonGroupProps {
  goal: Goal;
}

export const GoalApplicationButtonGroup: React.FC<
  GoalApplicationButtonGroupProps
> = ({ goal }) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { overallTotal } = useGoalLineItems(goal);
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
            settings: { monthlyGoal: overallTotal },
          },
        },
      },
      onCompleted: () => {
        enqueueSnackbar(t('Saved successfully.'), {
          variant: 'success',
        });
      },
      onError: () => {
        enqueueSnackbar(t('Saving failed.'), {
          variant: 'error',
        });
      },
    });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-start',
        mt: 4,
        mb: 2,
      }}
    >
      {!buttonsHidden && (
        <>
          <Button
            variant="contained"
            sx={{ mr: 2 }}
            onClick={() => onSave()}
            disabled={loading}
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
        </>
      )}
    </Box>
  );
};
