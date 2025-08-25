import React, { useState } from 'react';
import { DialogActions, DialogContent, DialogContentText } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import {
  CancelButton,
  SubmitButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import Modal from 'src/components/common/Modal/Modal';
import { useDeleteRecurringTransferMutation } from '../TransferMutations.generated';
import { TransferHistory } from '../mockData';

interface DeleteTransferModalProps {
  handleClose: () => void;
  transfer: TransferHistory;
}

export const DeleteTransferModal: React.FC<DeleteTransferModalProps> = ({
  handleClose,
  transfer,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const [deleting, setDeleting] = useState(false);

  const [deleteRecurringTransfer] = useDeleteRecurringTransferMutation();

  const handleDelete = () => {
    setDeleting(true);

    deleteRecurringTransfer({
      variables: {
        id: transfer.id ?? '',
      },
      update: (cache) => {
        cache.evict({ id: cache.identify({ id: transfer.id }) });
      },
    });

    enqueueSnackbar(t('Transfer stopped successfully'), { variant: 'success' });
    handleClose();
  };

  return (
    <Modal isOpen={true} title={t('Stop Transfer')} handleClose={handleClose}>
      <DialogContent dividers>
        <DialogContentText component={'div'}>
          {t('Are you sure you want to stop this recurring transfer?')}
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
