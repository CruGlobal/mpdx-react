import React, { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  DialogActions,
  DialogContent,
  Typography,
} from '@mui/material';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { CustomDateField } from 'src/components/Shared/DateTimePickers/CustomDateField';
import { CustomTimeField } from 'src/components/Shared/DateTimePickers/CustomTimeField';
import Modal from 'src/components/Shared/Modal/Modal';
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
  const initial = deadlineToPickerValue(cohort.questionnaireDeadline);
  const [date, setDate] = useState<DateTime | null>(initial);
  const [time, setTime] = useState<DateTime | null>(initial);
  const [setDeadline, { loading }] =
    useSetNewStaffCohortQuestionnaireDeadlineMutation();

  // Both are required: a date alone would lock at midnight, a time alone on whatever day the picker chose
  const complete = !!date?.isValid && !!time?.isValid;

  const save = async (deadline: string | null) => {
    try {
      await setDeadline({
        variables: { input: { id: cohort.id, deadline } },
        // Each row's questionnaireLocked is computed from the deadline on the server
        refetchQueries: ['NewStaffCohortAttendees'],
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

  const handleSave = () => {
    if (date && time) {
      save(
        pickerValueToDeadline(
          date.startOf('day').set({ hour: time.hour, minute: time.minute }),
        ),
      );
    }
  };

  return (
    <Modal
      isOpen
      size="xs"
      title={t('Questionnaire Deadline for {{training}}', {
        training: cohort.name,
      })}
      handleClose={onClose}
    >
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t(
            "After this time, households in this training can't change or submit their NSO MPD Questionnaire. Enter it in Eastern time.",
          )}
        </Typography>
        <Box display="flex" gap={2}>
          <CustomDateField label={t('Date')} value={date} onChange={setDate} />
          <CustomTimeField
            label={t('Time (Eastern)')}
            value={time}
            onChange={setTime}
          />
        </Box>
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
          disabled={loading || !complete}
          startIcon={
            loading ? <CircularProgress size={16} color="inherit" /> : null
          }
          onClick={handleSave}
        >
          {t('Save')}
        </Button>
      </DialogActions>
    </Modal>
  );
};
