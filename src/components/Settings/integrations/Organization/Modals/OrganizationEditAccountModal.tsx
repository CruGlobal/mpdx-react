import React, { ReactElement } from 'react';
import { Box, DialogActions, FormHelperText, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import {
  CancelButton,
  SubmitButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import Modal from 'src/components/common/Modal/Modal';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { useUpdateOrganizationAccountMutation } from '../Organizations.generated';
import { OrganizationFormikSchema } from '../schema';

interface OrganizationEditAccountModalProps {
  handleClose: () => void;
  organizationId: string;
}

const StyledBox = styled(Box)(() => ({
  padding: '0 10px',
}));

export const OrganizationEditAccountModal: React.FC<
  OrganizationEditAccountModalProps
> = ({ handleClose, organizationId }) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { appName } = useGetAppSettings();
  const [updateOrganizationAccount] = useUpdateOrganizationAccountMutation();

  const onSubmit = async (
    attributes: Omit<OrganizationFormikSchema, 'selectedOrganization'>,
  ) => {
    const { password, username } = attributes;

    const createAccountAttributes = {
      id: organizationId,
      username,
      password,
    };

    await updateOrganizationAccount({
      variables: {
        input: {
          attributes: createAccountAttributes,
        },
      },
      onError: () => {
        enqueueSnackbar(t('Unable to update your organization account'), {
          variant: 'error',
        });
      },
      onCompleted: () => {
        enqueueSnackbar(
          t('{{appName}} updated your organization account', { appName }),
          {
            variant: 'success',
          },
        );
      },
    });

    handleClose();
    return;
  };

  const OrganizationSchema: yup.ObjectSchema<
    Omit<OrganizationFormikSchema, 'selectedOrganization'>
  > = yup.object({
    username: yup.string().required(),
    password: yup.string().required(),
  });

  return (
    <Modal
      isOpen={true}
      title={t('Edit Organization Account')}
      handleClose={handleClose}
      size={'sm'}
    >
      <Formik
        initialValues={{
          username: '',
          password: '',
        }}
        validationSchema={OrganizationSchema}
        validateOnMount
        onSubmit={onSubmit}
      >
        {({
          values: { username, password },
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
                  id="username"
                  label={t('Username')}
                  value={username}
                  disabled={isSubmitting}
                  // eslint-disable-next-line jsx-a11y/no-autofocus
                  autoFocus={true}
                  onChange={handleChange('username')}
                />
                {errors.username && (
                  <FormHelperText error={true}>
                    {errors.username}
                  </FormHelperText>
                )}
              </FieldWrapper>
            </StyledBox>
            <StyledBox marginTop={2}>
              <FieldWrapper>
                <TextField
                  required
                  id="password"
                  label={t('Password')}
                  type="password"
                  value={password}
                  disabled={isSubmitting}
                  onChange={handleChange('password')}
                  inputProps={{
                    'data-testid': 'passwordInput',
                  }}
                />
                {errors.password && (
                  <FormHelperText error={true}>
                    {errors.password}
                  </FormHelperText>
                )}
              </FieldWrapper>
            </StyledBox>

            <DialogActions>
              <CancelButton onClick={handleClose} disabled={isSubmitting} />
              <SubmitButton disabled={!isValid || isSubmitting}>
                {t('Save')}
              </SubmitButton>
            </DialogActions>
          </form>
        )}
      </Formik>
    </Modal>
  );
};
