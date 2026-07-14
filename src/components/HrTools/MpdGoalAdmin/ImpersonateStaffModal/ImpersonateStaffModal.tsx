import { useRouter } from 'next/router';
import React, { ReactElement } from 'react';
import {
  DialogActions,
  DialogContent,
  TextField,
  Typography,
} from '@mui/material';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import {
  CancelButton,
  SubmitButton,
} from 'src/components/Shared/Modal/ActionButtons/ActionButtons';
import Modal from 'src/components/Shared/Modal/Modal';
import { getErrorMessage } from 'src/lib/getErrorFromCatch';

interface ImpersonateStaffModalProps {
  /** Name of the staff member to impersonate, shown in the modal title. */
  staffName: string;
  /** Email the impersonation session is started for. */
  staffEmail: string;
  handleClose: () => void;
}

interface ImpersonateStaffFormValues {
  reason: string;
}

export const ImpersonateStaffModal: React.FC<ImpersonateStaffModalProps> = ({
  staffName,
  staffEmail,
  handleClose,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { push } = useRouter();

  const impersonateStaffSchema: yup.ObjectSchema<ImpersonateStaffFormValues> =
    yup.object({
      reason: yup.string().required(t('Reason is required')),
    });

  // Mirrors the impersonation flow in
  // src/components/Settings/Admin/ImpersonateUser/ImpersonateUserAccordion.tsx
  const onSubmit = async ({ reason }: ImpersonateStaffFormValues) => {
    try {
      const setupImpersonate = await fetch(
        '/api/auth/impersonate/impersonateUser',
        {
          method: 'POST',
          body: JSON.stringify({
            user: staffEmail,
            reason,
          }),
        },
      );
      const setupImpersonateJson: { errors?: Array<{ detail: string }> } =
        await setupImpersonate.json();

      if (setupImpersonate.status === 200) {
        enqueueSnackbar(
          t('Redirecting you to home screen to impersonate user...'),
          {
            variant: 'success',
          },
        );
        push('/login');
      } else {
        setupImpersonateJson.errors?.forEach((error) => {
          enqueueSnackbar(error.detail, {
            variant: 'error',
          });
        });
      }
    } catch (err) {
      enqueueSnackbar(getErrorMessage(err), {
        variant: 'error',
      });
    }
  };

  return (
    <Modal
      isOpen
      title={t('Impersonate {{name}}', { name: staffName })}
      handleClose={handleClose}
      size="sm"
    >
      <Formik
        initialValues={{ reason: '' }}
        validationSchema={impersonateStaffSchema}
        onSubmit={onSubmit}
      >
        {({
          values: { reason },
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
          errors,
          touched,
        }): ReactElement => (
          <form onSubmit={handleSubmit} noValidate>
            <DialogContent dividers>
              <Typography>
                {t(
                  'You are about to impersonate {{name}} ({{email}}). You will be logged in on their behalf and will see what they see. Provide a reason for this impersonation.',
                  { name: staffName, email: staffEmail },
                )}
              </Typography>
              <TextField
                fullWidth
                required
                autoFocus
                id="reason"
                name="reason"
                label={t('Reason / HelpScout Ticket Link')}
                value={reason}
                disabled={isSubmitting}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.reason && Boolean(errors.reason)}
                helperText={touched.reason && errors.reason}
                sx={{ mt: 2 }}
              />
            </DialogContent>
            <DialogActions>
              <CancelButton onClick={handleClose} disabled={isSubmitting} />
              <SubmitButton disabled={isSubmitting}>
                {t('Impersonate')}
              </SubmitButton>
            </DialogActions>
          </form>
        )}
      </Formik>
    </Modal>
  );
};
