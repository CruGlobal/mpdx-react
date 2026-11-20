import React, { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { DateTimeFieldPair } from 'src/components/Shared/DateTimePickers/DateTimeFieldPair';
import {
  deadlineToPickerValue,
  pickerValueToDeadline,
} from '../../Shared/questionnaireDeadline';
import { Cohort } from '../mpdGoalAdminHelpers';
import { useSetNewStaffCohortQuestionnaireDeadlineMutation } from './SetNewStaffCohortQuestionnaireDeadline.generated';

interface QuestionnaireDeadlineDialogProps {
  cohort: Cohort;
  onClose: () => void;
}

/** Sets, changes or removes a training's questionnaire deadline, entered in Eastern time. */
export const QuestionnaireDeadlineDialog: React.FC<
  QuestionnaireDeadlineDialogProps
> = ({ cohort, onClose }) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [value, setValue] = useState<DateTime | null>(
    deadlineToPickerValue(cohort.questionnaireDeadline),
  );
  const [setDeadline, { loading }] =
    useSetNewStaffCohortQuestionnaireDeadlineMutation();

  const save = async (deadline: string | null) => {
    try {
      await setDeadline({
        variables: { input: { id: cohort.id, deadline } },
      });
    } catch {
      // The global Apollo error link already toasts; the dialog stays open to retry.
      return;
    }
    enqueueSnackbar(
      deadline
        ? t('Questionnaire deadline saved for {{training}}.', {
            training: cohort.name,
          })
        : t('Questionnaire deadline removed for {{training}}.', {
            training: cohort.name,
          }),
      { variant: 'success' },
    );
    onClose();
  };

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        {t('Questionnaire Deadline for {{training}}', {
          training: cohort.name,
        })}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t(
            "After this time, households in this training can't change or submit their NSO MPD Questionnaire. Enter it in Eastern time.",
          )}
        </Typography>
        <DateTimeFieldPair
          dateLabel={t('Date')}
          timeLabel={t('Time (Eastern)')}
          value={value}
          onChange={setValue}
          render={(dateField, timeField) => (
            <Box display="flex" gap={2}>
              {dateField}
              {timeField}
            </Box>
          )}
        />
      </DialogContent>
      <DialogActions>
        {cohort.questionnaireDeadline && (
          <Button
            color="error"
            disabled={loading}
            onClick={() => save(null)}
            sx={{ mr: 'auto' }}
          >
            {t('Remove Deadline')}
          </Button>
        )}
        <Button onClick={onClose}>{t('Cancel')}</Button>
        <Button
          variant="contained"
          disabled={loading || !value?.isValid}
          startIcon={
            loading ? <CircularProgress size={16} color="inherit" /> : null
          }
          onClick={() => value && save(pickerValueToDeadline(value))}
        >
          {t('Save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
