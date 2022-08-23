import { DialogActions, DialogContent, Typography } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../../common/Modal/Modal';
import { ActionButton } from 'src/components/Task/Modal/Form/TaskModalForm';

interface HideContactsModalProps {
  multi?: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  onConfirm: () => void;
}

export const HideContactsModal: React.FC<HideContactsModalProps> = ({
  multi = false,
  open,
  setOpen,
  onConfirm,
}) => {
  const { t } = useTranslation();

  return (
    <Modal
      title={multi ? t('Hide Contacts') : t('Hide Contact')}
      isOpen={open}
      handleClose={() => setOpen(false)}
    >
      <DialogContent dividers>
        <Typography>
          {t(
            'Are you sure you wish to hide the selected contact? Hiding a contact in MPDX actually sets the contact status to "Never Ask".',
            { count: multi ? 2 : 1 },
          )}
        </Typography>
      </DialogContent>
      <DialogActions>
        <ActionButton onClick={() => setOpen(false)}>{t('No')}</ActionButton>
        <ActionButton onClick={onConfirm}>{t('Yes')}</ActionButton>
      </DialogActions>
    </Modal>
  );
};
