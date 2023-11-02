import { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { Formik } from 'formik';
import * as yup from 'yup';
import {
  Typography,
  TextField,
  FormHelperText,
  Box,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useCreateAccountListInviteMutation } from './InviteForm.generated';
import {
  GetAccountListInvitesQuery,
  GetAccountListInvitesDocument,
} from '../ManageAccountAccess/ManageAccountAccess.generated';
import { InviteTypeEnum } from '../../../../../graphql/types.generated';
import { SubmitButton } from 'src/components/common/Modal/ActionButtons/ActionButtons';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { DialogActionsLeft } from 'src/components/Shared/Forms/DialogActions';
import { Confirmation } from 'src/components/common/Modal/Confirmation/Confirmation';

const StyledBox = styled(Box)(() => ({
  padding: '0 10px',
}));

export const InviteForm: React.FC = () => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const accountListId = useAccountListId() || '';
  const [isInviteConfirmationOpen, setIsInviteConfirmationOpen] =
    useState(false);

  const [createAccountListInvite] = useCreateAccountListInviteMutation();

  type formikSchemaType = {
    email: string;
  };

  const formikSchema: yup.SchemaOf<formikSchemaType> = yup.object({
    email: yup.string().email().required(),
  });

  const onSubmit = async () => {
    setIsInviteConfirmationOpen(true);
  };

  const handleConfirmInviteClose = () => setIsInviteConfirmationOpen(false);

  const handleConfirmInvite = async (email: string) => {
    await createAccountListInvite({
      variables: {
        input: {
          attributes: {
            accountListId,
            inviteUserAs: InviteTypeEnum.User,
            recipientEmail: email,
          },
        },
      },
      update: (cache, result) => {
        const query = {
          query: GetAccountListInvitesDocument,
          variables: {
            accountListId,
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
        enqueueSnackbar(t('MPDX sent an invite to {{email}}', { email }), {
          variant: 'success',
        });
      },
      onError: () => {
        enqueueSnackbar(
          t(
            "MPDX couldn't send an invite (check to see if email address is valid)",
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
      onSubmit={onSubmit}
      isInitialValid={false}
    >
      {({
        values: { email },
        handleChange,
        handleSubmit,
        isSubmitting,
        isValid,
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
                disabled={isSubmitting}
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
            <SubmitButton
              disabled={!isValid || isSubmitting}
              variant="contained"
            >
              {t('Share Account')}
            </SubmitButton>
          </DialogActionsLeft>

          <Confirmation
            isOpen={isInviteConfirmationOpen}
            title={t('Confirm')}
            message={
              <>
                <Typography>
                  {t(
                    `You are about to share access to your MPDX account with another user. This will give them access to view and
                modify all of your Contacts, Tasks, Donations, and any other information in your MPDX account.`,
                  )}
                </Typography>
                <Alert severity="error" style={{ margin: '10px 0' }}>
                  {t('Are you sure you want to proceed?')}
                </Alert>
                <Typography>
                  {t(
                    ` If you are trying to share coaching access please click Cancel below and try again through the Manage
                Coaches page in Settings.`,
                  )}
                </Typography>
              </>
            }
            handleClose={handleConfirmInviteClose}
            mutation={() => handleConfirmInvite(email)}
          />
        </form>
      )}
    </Formik>
  );
};
