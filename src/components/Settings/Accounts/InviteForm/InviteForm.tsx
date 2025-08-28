import { ReactElement, useState } from 'react';
import { Alert, FormHelperText, TextField, Typography } from '@mui/material';
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { DialogActionsLeft } from 'src/components/Shared/Forms/DialogActions';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { StyledBox } from 'src/components/Shared/styledComponents/StyledBox';
import { SubmitButton } from 'src/components/common/Modal/ActionButtons/ActionButtons';
import { Confirmation } from 'src/components/common/Modal/Confirmation/Confirmation';
import { InviteTypeEnum } from 'src/graphql/types.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import {
  GetAccountListInvitesDocument,
  GetAccountListInvitesQuery,
} from '../ManageAccounts/ManageAccounts.generated';
import { useCreateAccountListInviteMutation } from './InviteForm.generated';

type FormikSchema = {
  email: string;
};

const formikSchema: yup.ObjectSchema<FormikSchema> = yup.object({
  email: yup.string().email().required(),
});

type InviteFormProps = {
  type: InviteTypeEnum;
};

export const InviteForm: React.FC<InviteFormProps> = ({ type }) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const accountListId = useAccountListId() || '';
  const [isInviteConfirmationOpen, setIsInviteConfirmationOpen] =
    useState(false);
  const { appName } = useGetAppSettings();

  const [createAccountListInvite] = useCreateAccountListInviteMutation();

  const handleSubmit = () => {
    setIsInviteConfirmationOpen(true);
  };

  const handleConfirmInviteClose = () => setIsInviteConfirmationOpen(false);

  const handleConfirmInvite = async (email: string, onComplete: () => void) => {
    await createAccountListInvite({
      variables: {
        input: {
          attributes: {
            accountListId,
            inviteUserAs: type,
            recipientEmail: email,
          },
        },
      },
      update: (cache, result) => {
        const query = {
          query: GetAccountListInvitesDocument,
          variables: {
            accountListId,
            inviteType: type,
          },
        };
        const dataFromCache =
          cache.readQuery<GetAccountListInvitesQuery>(query);
        if (
          dataFromCache &&
          result.data?.createAccountListInvite?.accountListInvite
        ) {
          const data = {
            ...dataFromCache,
            accountListInvites: {
              ...dataFromCache.accountListInvites,
              nodes: [
                ...dataFromCache.accountListInvites.nodes,
                result.data?.createAccountListInvite?.accountListInvite,
              ],
            },
          };
          cache.writeQuery({ ...query, data });
        }
      },
      onCompleted: () => {
        enqueueSnackbar(
          t('{{appName}} sent an invite to {{email}}', { email, appName }),
          {
            variant: 'success',
          },
        );
        onComplete();
      },
      onError: () => {
        enqueueSnackbar(
          t(
            "{{appName}} couldn't send an invite (check to see if email address is valid)",
            { appName },
          ),
          {
            variant: 'error',
          },
        );
      },
    });
  };

  return (
    <Formik
      initialValues={{
        email: '',
      }}
      validationSchema={formikSchema}
      onSubmit={handleSubmit}
      isInitialValid={false}
    >
      {({
        values: { email },
        handleChange,
        handleSubmit,
        isValid,
        resetForm,
        errors,
      }): ReactElement => (
        <form onSubmit={handleSubmit}>
          <StyledBox marginTop={4}>
            <Typography marginBottom={2}>
              {t('Invite someone to share this account')}
            </Typography>
            <FieldWrapper>
              <TextField
                required
                id="email"
                type="email"
                name="email"
                value={email}
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus={true}
                placeholder="person.to.share@cru.org"
                onChange={handleChange}
              />
              {errors.email && (
                <FormHelperText error={true}>{errors.email}</FormHelperText>
              )}
            </FieldWrapper>
          </StyledBox>

          <DialogActionsLeft>
            <SubmitButton disabled={!isValid} variant="contained">
              {t('Share Account')}
            </SubmitButton>
          </DialogActionsLeft>

          <Confirmation
            isOpen={isInviteConfirmationOpen}
            title={t('Confirm')}
            message={
              <>
                {type === InviteTypeEnum.User && (
                  <>
                    <Typography>
                      {t(
                        `You are about to share access to your {{appName}} account with another user. This will give them access to view and
                  modify all of your Contacts, Tasks, Donations, and any other information in your {{appName}} account.`,
                        { appName },
                      )}
                    </Typography>
                    <Alert severity="error" style={{ margin: '10px 0' }}>
                      {t('Are you sure you want to proceed?')}
                    </Alert>
                    <Typography>
                      {t(
                        `If you are trying to share coaching access please click No below and try again through the Manage
                  Coaches page in Settings.`,
                      )}
                    </Typography>
                  </>
                )}
                {type === InviteTypeEnum.Coach && (
                  <Typography>
                    {t(`Are you sure you want to proceed?`)}
                  </Typography>
                )}
              </>
            }
            handleClose={handleConfirmInviteClose}
            mutation={() => handleConfirmInvite(email, () => resetForm())}
          />
        </form>
      )}
    </Formik>
  );
};
