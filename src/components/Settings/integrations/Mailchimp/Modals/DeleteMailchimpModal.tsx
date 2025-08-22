import React, { useState } from 'react';
import { DialogContent, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { StyledDialogActions } from 'src/components/Shared/styledComponents/styledComponents';
import {
  CancelButton,
  SubmitButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import Modal from 'src/components/common/Modal/Modal';
import { useDeleteMailchimpAccountMutation } from '../MailchimpAccount.generated';

interface DeleteMailchimpAccountModalProps {
  handleClose: () => void;
  accountListId: string;
  refetchMailchimpAccount: () => void;
  appName: string;
}

export const DeleteMailchimpAccountModal: React.FC<
  DeleteMailchimpAccountModalProps
> = ({ handleClose, accountListId, refetchMailchimpAccount, appName }) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const [deleteMailchimpAccount] = useDeleteMailchimpAccountMutation();

  const handleDelete = async () => {
    setIsSubmitting(true);

    await deleteMailchimpAccount({
      variables: {
        input: {
          accountListId: accountListId,
        },
      },
      update: () => refetchMailchimpAccount(),
      onCompleted: () => {
        enqueueSnackbar(
          t('{{appName}} removed your integration with Mailchimp', { appName }),
          {
            variant: 'success',
          },
        );
        handleClose();
      },
      onError: () => {
        enqueueSnackbar(
          t(
            "{{appName}} couldn't save your configuration changes for Mailchimp",
            { appName },
          ),
          {
            variant: 'error',
          },
        );
      },
    });
    setIsSubmitting(false);
  };

  return (
    <Modal
      isOpen={true}
      title={t('Confirm to Disconnect Mailchimp Account')}
      handleClose={handleClose}
      size={'sm'}
    >
      <DialogContent>
        <Typography>
          {t(`Are you sure you wish to disconnect your Mailchimp account?`)}
        </Typography>
      </DialogContent>

      <StyledDialogActions>
        <CancelButton onClick={handleClose} disabled={isSubmitting} />
        <SubmitButton disabled={isSubmitting} onClick={handleDelete}>
          {t('Confirm')}
        </SubmitButton>
      </StyledDialogActions>
    </Modal>
  );
};
