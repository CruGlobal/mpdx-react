import React, { ReactElement } from 'react';
import { Formik } from 'formik';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { DialogActions, TextField, FormHelperText } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Box } from '@mui/system';
import Modal from 'src/components/common/Modal/Modal';
import {
  SubmitButton,
  CancelButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { useUpdateOrganizationAccountMutation } from '../Organizations.generated';
import { useSnackbar } from 'notistack';
import { OrganizationFormikSchema } from './OrganizationAddAccountModal';

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
        enqueueSnackbar(t('MPDX updated your organization account'), {
          variant: 'success',
        });
      },
    });

    handleClose();
    return;
  };

  const OrganizationSchema: yup.SchemaOf<
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
          selectedOrganization: undefined,
          username: '',
          password: '',
        }}
        validationSchema={OrganizationSchema}
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
