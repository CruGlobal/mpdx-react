import React from 'react';
import { DialogActions, DialogContent, TextField } from '@mui/material';
import { Form, Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import {
  CancelButton,
  SubmitButton,
} from 'src/components/Shared/Modal/ActionButtons/ActionButtons';
import Modal from 'src/components/Shared/Modal/Modal';
import { StyledDialogContentText } from 'src/components/Shared/styledComponents/StyledDialogContentText';
import {
  SendableScenarioGoal,
  normalizeEmailAddress,
} from './sendScenarioGoalHelpers';

export interface SendScenarioGoalDialogProps {
  isOpen: boolean;
  /** Kept set through the close transition so the dialog doesn't flash empty. */
  goal: SendableScenarioGoal | null;
  /** Changes on every request so reopening the same goal starts a fresh form. */
  requestId: number;
  /** A rejection keeps the dialog open; the global Apollo error link already toasts it. */
  onSend: (emailAddress: string) => Promise<unknown>;
  handleClose: () => void;
}

interface SendScenarioGoalValues {
  emailAddress: string;
}

const initialValues: SendScenarioGoalValues = { emailAddress: '' };

/** Collects the address a scenario goal's worksheet is emailed to. */
export const SendScenarioGoalDialog: React.FC<SendScenarioGoalDialogProps> = ({
  isOpen,
  goal,
  requestId,
  onSend,
  handleClose,
}) => {
  const { t } = useTranslation();

  const validationSchema = yup.object({
    emailAddress: yup
      .string()
      .trim()
      .email(t('Enter a valid email address.'))
      .required(t('Enter a valid email address.')),
  });

  const handleSubmit = async ({ emailAddress }: SendScenarioGoalValues) => {
    try {
      await onSend(normalizeEmailAddress(emailAddress));
      handleClose();
    } catch {
      // Stay open so the address can be corrected and sent again.
    }
  };

  const name =
    [goal?.firstName, goal?.lastName].filter(Boolean).join(' ') ||
    t('this scenario goal');

  return (
    <Formik
      // Keyed by request so each opening starts with no address.
      key={requestId}
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({
        values,
        errors,
        touched,
        isSubmitting,
        handleChange,
        handleBlur,
      }) => {
        // A blank field is only blocked, so tabbing past it doesn't flash an error.
        const hasAddress = !!values.emailAddress.trim();
        const invalid =
          hasAddress && !!touched.emailAddress && !!errors.emailAddress;

        return (
          <Modal
            isOpen={isOpen}
            title={t('Email Support Goals Worksheet')}
            // The close icon and backdrop would otherwise dismiss the dialog mid-send.
            handleClose={() => !isSubmitting && handleClose()}
          >
            {goal && (
              <Form noValidate aria-busy={isSubmitting}>
                <DialogContent dividers>
                  <StyledDialogContentText sx={{ mb: 2 }}>
                    {t(
                      'Email the support goals worksheet for {{name}} to this address. This cannot be undone.',
                      { name },
                    )}
                  </StyledDialogContentText>
                  <TextField
                    type="email"
                    name="emailAddress"
                    label={t('Email address')}
                    value={values.emailAddress}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={isSubmitting}
                    required
                    fullWidth
                    error={invalid}
                    helperText={invalid ? errors.emailAddress : ' '}
                    autoFocus
                  />
                </DialogContent>
                <DialogActions>
                  <CancelButton onClick={handleClose} disabled={isSubmitting}>
                    {t('Cancel')}
                  </CancelButton>
                  <SubmitButton
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting || invalid || !hasAddress}
                  >
                    {t('Send Worksheet')}
                  </SubmitButton>
                </DialogActions>
              </Form>
            )}
          </Modal>
        );
      }}
    </Formik>
  );
};
