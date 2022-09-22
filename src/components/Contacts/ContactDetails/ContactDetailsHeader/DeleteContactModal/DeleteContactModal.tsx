import {
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Modal from 'src/components/common/Modal/Modal';
import {
  CancelButton,
  DeleteButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';

const LoadingIndicator = styled(CircularProgress)(({ theme }) => ({
  margin: theme.spacing(0, 1, 0, 0),
}));

interface DeleteContactModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  deleting: boolean;
  deleteContact: () => void;
}

export const DeleteContactModal: React.FC<DeleteContactModalProps> = ({
  open,
  setOpen,
  deleting,
  deleteContact,
}) => {
  const { t } = useTranslation();
  return (
    <Modal
      isOpen={open}
      title={t('Delete Contact')}
      handleClose={() => setOpen(false)}
    >
      <DialogContent dividers>
        <DialogContentText>
          {t(
            'Are you sure you want to permanently delete this contact? Doing so will permanently delete this contacts information, as well as task history. This cannot be undone. If you wish to keep this information, you can try hiding this contact instead.',
          )}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <CancelButton
          size="large"
          disabled={deleting}
          onClick={() => setOpen(false)}
        />
        <DeleteButton
          size="large"
          variant="contained"
          disabled={deleting}
          onClick={deleteContact}
          sx={{ marginRight: 0 }}
        >
          {deleting && <LoadingIndicator size={20} />}
          {t('delete contact')}
        </DeleteButton>
      </DialogActions>
    </Modal>
  );
};
