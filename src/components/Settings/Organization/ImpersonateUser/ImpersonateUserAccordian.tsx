import { ReactElement, useContext, useEffect, useState } from 'react';
import {
  Box,
  DialogActions,
  FormHelperText,
  TextField,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Formik } from 'formik';
import { getSession } from 'next-auth/react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import {
  OrganizationsContext,
  OrganizationsContextType,
} from 'pages/accountLists/[accountListId]/settings/organizations.page';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { StyledFormLabel } from 'src/components/Shared/Forms/Field';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { SubmitButton } from 'src/components/common/Modal/ActionButtons/ActionButtons';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { getErrorMessage } from 'src/lib/getErrorFromCatch';
import { AccordianProps } from '../../accordianHelper';

const StyledBox = styled(Box)(() => ({
  padding: '0 10px',
}));

export const ImpersonateUserAccordian: React.FC<AccordianProps> = ({
  handleAccordionChange,
  expandedPanel,
}) => {
  const { t } = useTranslation();
  const accordianName = t('Impersonate User');
  const { enqueueSnackbar } = useSnackbar();
  const { appName } = useGetAppSettings();
  const [userId, setUserID] = useState('');

  const { selectedOrganizationId } = useContext(
    OrganizationsContext,
  ) as OrganizationsContextType;

  useEffect(() => {
    (async () => {
      const session = await getSession();
      setUserID(session?.user.userID ?? '');
    })();
  }, []);

  type ImpersonateUserFormType = {
    user: string;
    reason: string;
  };

  const ImpersonateUserSchema: yup.SchemaOf<ImpersonateUserFormType> =
    yup.object({
      user: yup.string().email().required(),
      reason: yup.string().required(),
    });

  const onSubmit = async (attributes: ImpersonateUserFormType) => {
    try {
      const { user, reason } = attributes;
      const setupImpersonate = await fetch(
        '/api/auth/impersonate/impersonateOrganization',
        {
          method: 'POST',
          body: JSON.stringify({
            userId,
            organizationId: selectedOrganizationId,
            user,
            reason,
          }),
        },
      );
      const setupImpersonateJson = await setupImpersonate.json();

      if (setupImpersonate.status !== 200) {
        setupImpersonateJson.errors.forEach((error) => {
          enqueueSnackbar(error.detail, {
            variant: 'error',
          });
        });
      } else {
        enqueueSnackbar(
          t('Redirecting you to home screen to impersonate user...'),
          {
            variant: 'success',
          },
        );
        window.location.href = `${process.env.SITE_URL}/login`;
      }
    } catch (err) {
      enqueueSnackbar(getErrorMessage(err), {
        variant: 'error',
      });
    }
  };

  return (
    <AccordionItem
      onAccordionChange={handleAccordionChange}
      expandedPanel={expandedPanel}
      label={accordianName}
      value={''}
    >
      <StyledFormLabel>{accordianName}</StyledFormLabel>
      <Typography>
        {t(
          `This will log you in on behalf of the user specified below. You will be able to see what the user sees on {{appName}}.
          Impersonation sessions have 20 minute timeout where you will automatically be logged out of the user's account after
          the specified amount of time. Once you are finished impersonating, click 'Exit Impersonation Mode' at the top of the
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
            <StyledBox marginTop={4}>
              <FieldWrapper>
                <TextField
                  required
                  id="user"
                  label={t('User Name, ID or Key/Relay Email')}
                  type="email"
                  value={user}
                  disabled={isSubmitting}
                  // eslint-disable-next-line jsx-a11y/no-autofocus
                  autoFocus={true}
                  onChange={handleChange('user')}
                  inputProps={{
                    'data-testid': 'impersonateUsername',
                  }}
                />
                {errors.user && (
                  <FormHelperText error={true}>{errors.user}</FormHelperText>
                )}
              </FieldWrapper>
            </StyledBox>
            <StyledBox marginTop={2}>
              <FieldWrapper>
                <TextField
                  required
                  id="reason"
                  label={t('Reason / Helpscout Ticket Link')}
                  type="reason"
                  value={reason}
                  disabled={isSubmitting}
                  onChange={handleChange('reason')}
                  inputProps={{
                    'data-testid': 'impersonateReason',
                  }}
                />
              </FieldWrapper>
            </StyledBox>

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
