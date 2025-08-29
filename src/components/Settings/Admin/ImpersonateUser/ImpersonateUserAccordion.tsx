import { useRouter } from 'next/router';
import { ReactElement } from 'react';
import {
  DialogActions,
  FormHelperText,
  TextField,
  Typography,
} from '@mui/material';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { AdminAccordion } from 'src/components/Shared/Forms/Accordions/AccordionEnum';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { StyledFormLabel } from 'src/components/Shared/Forms/FieldHelper';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { PaddedBox } from 'src/components/Shared/styledComponents/PaddedBox';
import { SubmitButton } from 'src/components/common/Modal/ActionButtons/ActionButtons';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
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
  const { appName } = useGetAppSettings();
  const { push } = useRouter();

  const onSubmit = async (attributes: ImpersonateUserFormType) => {
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
  };

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
        initialValues={{
          user: '',
          reason: '',
        }}
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
                  // eslint-disable-next-line jsx-a11y/no-autofocus
                  autoFocus={true}
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
                  type="reason"
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
