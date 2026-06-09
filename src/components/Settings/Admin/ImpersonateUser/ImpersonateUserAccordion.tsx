import { useRouter } from 'next/router';
import { ReactElement, useCallback, useEffect, useRef } from 'react';
import {
  DialogActions,
  FormHelperText,
  TextField,
  Typography,
} from '@mui/material';
import { Formik, FormikProps } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { AdminAccordion } from 'src/components/Shared/Forms/Accordions/AccordionEnum';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { StyledFormLabel } from 'src/components/Shared/Forms/FieldHelper';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { SubmitButton } from 'src/components/Shared/Modal/ActionButtons/ActionButtons';
import { PaddedBox } from 'src/components/Shared/styledComponents/PaddedBox';
import { getAppName } from 'src/lib/getAppName';
import { getErrorMessage } from 'src/lib/getErrorFromCatch';
import { AccordionProps } from '../../accordionHelper';

type ImpersonateUserFormType = {
  user: string;
  reason: string;
};

const ImpersonateUserSchema: yup.ObjectSchema<ImpersonateUserFormType> =
  yup.object({
    user: yup.string().email().required(),
    reason: yup.string().required(),
  });

export const ImpersonateUserAccordion: React.FC<
  AccordionProps<AdminAccordion>
> = ({ handleAccordionChange, expandedAccordion }) => {
  const { t } = useTranslation();
  const accordionName = t('Impersonate User');
  const { enqueueSnackbar } = useSnackbar();
  const appName = getAppName();
  const { push, query, isReady } = useRouter();

  // Optional query params used to prefill and auto-submit the form, i.e.
  // /settings/admin?email=user@cru.org&reason=HS-1234
  const initialUser = typeof query.email === 'string' ? query.email : '';
  const initialReason = typeof query.reason === 'string' ? query.reason : '';
  const autoSubmitted = useRef(false);
  const formikRef = useRef<FormikProps<ImpersonateUserFormType>>(null);

  const onSubmit = useCallback(
    async (attributes: ImpersonateUserFormType) => {
      try {
        const { user, reason } = attributes;
        const setupImpersonate = await fetch(
          '/api/auth/impersonate/impersonateUser',
          {
            method: 'POST',
            body: JSON.stringify({
              user,
              reason,
            }),
          },
        );
        const setupImpersonateJson = await setupImpersonate.json();

        if (setupImpersonate.status === 200) {
          enqueueSnackbar(
            t('Redirecting you to home screen to impersonate user...'),
            {
              variant: 'success',
            },
          );
          push('/login');
        } else {
          setupImpersonateJson.errors.forEach((error) => {
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
    },
    [enqueueSnackbar, push, t],
  );

  // When both query params are present and valid, skip the form and start
  // impersonating immediately
  useEffect(() => {
    if (autoSubmitted.current || !isReady) {
      return;
    }
    const values = { user: initialUser, reason: initialReason };
    if (
      initialUser &&
      initialReason &&
      ImpersonateUserSchema.isValidSync(values)
    ) {
      autoSubmitted.current = true;
      // Submit through Formik so the submission lifecycle (isSubmitting,
      // disabled fields/button) stays consistent with the manual path
      void formikRef.current?.submitForm();
    }
  }, [isReady, initialUser, initialReason]);

  return (
    <AccordionItem
      accordion={AdminAccordion.ImpersonateUser}
      onAccordionChange={handleAccordionChange}
      expandedAccordion={expandedAccordion}
      label={accordionName}
      value={''}
    >
      <StyledFormLabel>{accordionName}</StyledFormLabel>
      <Typography>
        {t(
          `This will log you in on behalf of the user specified below. You will be able to see what the user sees on {{appName}}.
          Impersonation sessions have 20 minute timeout where you will automatically be logged out of the user's account after
          the specified amount of time. Once you are finished impersonating, click 'Stop Impersonating' at the top of the
          page.`,
          { appName },
        )}
      </Typography>

      <Formik
        innerRef={formikRef}
        initialValues={{
          user: initialUser,
          reason: initialReason,
        }}
        enableReinitialize
        validationSchema={ImpersonateUserSchema}
        onSubmit={onSubmit}
        isInitialValid={false}
      >
        {({
          values: { user, reason },
          handleChange,
          handleSubmit,
          isSubmitting,
          isValid,
          errors,
        }): ReactElement => (
          <form onSubmit={handleSubmit}>
            <PaddedBox marginTop={4}>
              <FieldWrapper>
                <TextField
                  required
                  id="user"
                  label={t('Okta User Name / Email')}
                  type="email"
                  value={user}
                  disabled={isSubmitting}
                  autoFocus
                  name="user"
                  onChange={handleChange}
                />
                {errors.user && (
                  <FormHelperText error={true}>{errors.user}</FormHelperText>
                )}
              </FieldWrapper>
            </PaddedBox>
            <PaddedBox marginTop={2}>
              <FieldWrapper>
                <TextField
                  required
                  id="reason"
                  label={t('Reason / HelpScout Ticket Link')}
                  type="text"
                  value={reason}
                  disabled={isSubmitting}
                  name="reason"
                  onChange={handleChange}
                />
              </FieldWrapper>
            </PaddedBox>

            <DialogActions>
              <SubmitButton
                disabled={!isValid || isSubmitting}
                variant="contained"
              >
                {t('Impersonate User')}
              </SubmitButton>
            </DialogActions>
          </form>
        )}
      </Formik>
    </AccordionItem>
  );
};
