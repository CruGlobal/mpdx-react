import React, { useState } from 'react';
import { DialogActions, DialogContent, DialogContentText } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import {
  CancelButton,
  SubmitButton,
} from 'src/components/Shared/Modal/ActionButtons/ActionButtons';
import Modal from 'src/components/Shared/Modal/Modal';
import { useDeleteRecurringTransferMutation } from '../TransferMutations.generated';
import { ActionTypeEnum, Transfers } from '../mockData';

interface DeleteTransferModalProps {
  handleClose: () => void;
  transfer: Transfers;
  type: ActionTypeEnum;
}

export const DeleteTransferModal: React.FC<DeleteTransferModalProps> = ({
  handleClose,
  transfer,
  type,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const [deleting, setDeleting] = useState(false);

  const [deleteRecurringTransfer] = useDeleteRecurringTransferMutation({
    refetchQueries: ['ReportsSavingsFundTransfer', 'AccountFunds'],
    awaitRefetchQueries: true,
  });

  const handleDelete = () => {
    setDeleting(true);

    deleteRecurringTransfer({
      variables: {
        id: transfer.recurringId ?? '',
      },
    });

    enqueueSnackbar(t('Transfer stopped successfully'), { variant: 'success' });
    handleClose();
  };

  return (
    <Modal
      isOpen={true}
      title={
        type === ActionTypeEnum.Stop ? t('Stop Transfer') : t('Cancel Transfer')
      }
      handleClose={handleClose}
    >
      <DialogContent dividers>
        <DialogContentText component={'div'}>
          {type === ActionTypeEnum.Stop
            ? t('Are you sure you want to stop this recurring transfer?')
            : t('Are you sure you want to cancel this recurring transfer?')}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <CancelButton onClick={handleClose} disabled={deleting}>
          {t('No')}
        </CancelButton>
        <SubmitButton type="button" onClick={handleDelete} disabled={deleting}>
          {t('Yes')}
        </SubmitButton>
      </DialogActions>
    </Modal>
  );
};
