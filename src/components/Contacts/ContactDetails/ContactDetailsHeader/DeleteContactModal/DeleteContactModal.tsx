import {
  Button,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogContentText,
  styled,
} from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Modal from 'src/components/common/Modal/Modal';

const DialogDeleteButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.error.main,
  color: theme.palette.common.white,
  '&:hover': {
    backgroundColor: theme.palette.error.dark,
  },
}));

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
        <Button disabled={deleting} onClick={() => setOpen(false)}>
          {t('Cancel')}
        </Button>
        <DialogDeleteButton
          size="large"
          variant="contained"
          disabled={deleting}
          onClick={deleteContact}
        >
          {deleting && <LoadingIndicator size={20} />}
          {t('delete contact')}
        </DialogDeleteButton>
      </DialogActions>
    </Modal>
  );
};
