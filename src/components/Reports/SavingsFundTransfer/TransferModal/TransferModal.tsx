import { useState } from 'react';
import { DialogActions, DialogContent, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import {
  CancelButton,
  SubmitButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import Modal from 'src/components/common/Modal/Modal';

export enum TransferTypeEnum {
  New = 'new',
  Edit = 'edit',
}

export interface TransferModalData {
  title: string;
  type: TransferTypeEnum;
  accountTransferFromId?: string;
  accountTransferToId?: string;
}

interface TransferModalProps {
  handleClose: () => void;
  data: TransferModalData;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  data,
  handleClose,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  // remove later once we have the mutation.
  const [deleting, setDeleting] = useState(false);

  const { title } = data;

  const handleSubmit = () => {
    // Handle the submit logic here

    setDeleting(true);

    enqueueSnackbar(t('Transfer successful'), {
      variant: 'success',
    });
  };

  return (
    <Modal title={title} isOpen={true} handleClose={handleClose}>
      <DialogContent dividers>
        <Typography variant="h4">{t('New Transfers')}</Typography>
      </DialogContent>

      <DialogActions>
        <CancelButton size="large" disabled={deleting} onClick={handleClose} />
        <SubmitButton
          size="large"
          variant="contained"
          disabled={deleting}
          onClick={handleSubmit}
        >
          {t('Submit')}
        </SubmitButton>
      </DialogActions>
    </Modal>
  );
};
