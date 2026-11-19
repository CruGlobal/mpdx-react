import React from 'react';
import { FormControlLabel, Switch } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useMpdGoalAdmin } from '../MpdGoalAdminContext';
import { useSetNewStaffCohortQuestionnaireOpenMutation } from './SetNewStaffCohortQuestionnaireOpen.generated';

/** Opens or closes the NSO MPD Questionnaire for the selected training; read-only for coordinators. */
export const QuestionnaireOpenSwitch: React.FC = () => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { selectedCohort, isGoalsAdmin } = useMpdGoalAdmin();
  const [setQuestionnaireOpen, { loading }] =
    useSetNewStaffCohortQuestionnaireOpenMutation();

  const open = !!selectedCohort?.questionnaireOpen;
  const status = open ? t('Open') : t('Closed');

  if (!isGoalsAdmin || !selectedCohort) {
    return <span>{selectedCohort ? status : '—'}</span>;
  }

  const handleChange = async (checked: boolean) => {
    try {
      await setQuestionnaireOpen({
        variables: { input: { id: selectedCohort.id, open: checked } },
      });
    } catch {
      // The global Apollo error link already toasts; the switch keeps the saved value.
      return;
    }
    enqueueSnackbar(
      checked
        ? t('The NSO MPD Questionnaire is now open for {{training}}.', {
            training: selectedCohort.name,
          })
        : t('The NSO MPD Questionnaire is now closed for {{training}}.', {
            training: selectedCohort.name,
          }),
      { variant: 'success' },
    );
  };

  return (
    <FormControlLabel
      sx={{ m: 0 }}
      control={
        <Switch
          size="small"
          checked={open}
          disabled={loading}
          onChange={(event) => handleChange(event.target.checked)}
          slotProps={{
            input: { 'aria-label': t('NSO MPD Questionnaire') },
          }}
        />
      }
      label={status}
    />
  );
};
