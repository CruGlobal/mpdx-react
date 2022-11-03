import { Button, CircularProgress, DialogActions, DialogContent, DialogContentText } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Modal from 'src/components/common/Modal/Modal';

interface MoreActionHideContactProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  hiding: boolean;
  hideContact: () => void;
}

export const MoreActionHideContactModal: React.FC<MoreActionHideContactProps> = ({
  open,
  setOpen,
  hiding,
  hideContact,
}) => {
  const { t } = useTranslation();

  return (
    <Modal
      title={t('Hide Contact')}
      isOpen={open}
      handleClose={() => setOpen(false)}
    >
      <DialogContent dividers>
        <DialogContentText>
          {t(
            'Are you sure you wish to hide the selected contact? Hiding a contact in MPDX actually sets the contact status to "Never Ask".',
          )}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)} disabled={hiding} variant="text">
          {t('Cancel')}
        </Button>
        <Button
          color="primary"
          type="submit"
          variant="contained"
          onClick={hideContact}
          disabled={hiding}
        >
          {hiding && <CircularProgress color="primary" size={20} />}
          {t('Hide')}
        </Button>
      </DialogActions>
    </Modal>
  );
};
