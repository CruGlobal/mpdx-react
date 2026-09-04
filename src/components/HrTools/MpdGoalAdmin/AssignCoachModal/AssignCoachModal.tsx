import React, { ReactElement, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  DialogActions,
  DialogContent,
  TextField,
  Typography,
} from '@mui/material';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import {
  CancelButton,
  SubmitButton,
} from 'src/components/Shared/Modal/ActionButtons/ActionButtons';
import Modal from 'src/components/Shared/Modal/Modal';
import { AssignCoachOption } from '../mpdGoalAdminHelpers';

interface AssignCoachModalProps {
  /** Name shown in the modal title, e.g. the staff member the coach is for. */
  subjectName: string;
  coaches: AssignCoachOption[];
  /** True while the coach list is loading, so an empty list isn't called empty yet. */
  loading?: boolean;
  /** Staff who already have a coach; when non-empty a reassignment warning lists them. */
  reassignedNames?: string[];
  handleClose: () => void;
  handleAssignCoach: (coachId: string) => Promise<void> | void;
}

const assignCoachSchema = yup.object({
  coachId: yup.string().required(),
});

type AssignCoachFormValues = yup.InferType<typeof assignCoachSchema>;

export const AssignCoachModal: React.FC<AssignCoachModalProps> = ({
  subjectName,
  coaches,
  loading = false,
  reassignedNames,
  handleClose,
  handleAssignCoach,
}) => {
  const { t } = useTranslation();
  const [failed, setFailed] = useState(false);
  const noCoaches = !loading && coaches.length === 0;

  const onSubmit = async ({ coachId }: AssignCoachFormValues) => {
    setFailed(false);
    try {
      await handleAssignCoach(coachId);
    } catch {
      // Stay open to retry; the global error link toasts the server's own reason.
      setFailed(true);
      return;
    }
    handleClose();
  };

  return (
    <Modal
      isOpen
      title={t('Assign Coach for {{name}}', { name: subjectName })}
      handleClose={handleClose}
      size="sm"
    >
      <Formik
        initialValues={{ coachId: '' }}
        validationSchema={assignCoachSchema}
        onSubmit={onSubmit}
      >
        {({
          values: { coachId },
          handleSubmit,
          setFieldValue,
          isSubmitting,
        }): ReactElement => (
          <form onSubmit={handleSubmit} noValidate>
            <DialogContent dividers>
              {failed && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {t('The coach could not be assigned. Please try again.')}
                </Alert>
              )}
              {reassignedNames && reassignedNames.length > 0 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="body2" fontWeight="bold">
                    {t(
                      '{{reassigned}} of the selected staff already have a coach.',
                      { reassigned: reassignedNames.length },
                    )}
                  </Typography>
                  <Typography variant="body2">
                    {t(
                      'Assigning a new coach will replace the current coach for the following staff.',
                    )}
                  </Typography>
                  <Box component="ul" sx={{ m: 0, mt: 1, pl: 3 }}>
                    {reassignedNames.map((name) => (
                      <li key={name}>{name}</li>
                    ))}
                  </Box>
                </Alert>
              )}
              {noCoaches ? (
                <Alert severity="info">
                  {t(
                    'No coaches are available to assign for this cohort. Coach eligibility comes from OneApp.',
                  )}
                </Alert>
              ) : (
                <Autocomplete
                  autoHighlight
                  loading={loading}
                  disabled={isSubmitting || loading}
                  value={coaches.find((coach) => coach.id === coachId) ?? null}
                  onChange={(_, value) =>
                    setFieldValue('coachId', value?.id ?? '')
                  }
                  options={coaches}
                  getOptionLabel={(coach) => coach.name}
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
                  fullWidth
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t('Coach')}
                      placeholder={t('Select a coach')}
                      autoFocus
                    />
                  )}
                />
              )}
            </DialogContent>
            <DialogActions>
              <CancelButton onClick={handleClose} disabled={isSubmitting} />
              <SubmitButton disabled={!coachId || isSubmitting}>
                {t('Save')}
              </SubmitButton>
            </DialogActions>
          </form>
        )}
      </Formik>
    </Modal>
  );
};
