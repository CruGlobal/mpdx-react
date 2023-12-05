import React from 'react';
import { DialogActions, DialogContent, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  CancelButton,
  SubmitButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import Modal from '../../common/Modal/Modal';

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
  const { appName } = useGetAppSettings();

  return (
    <Modal
      title={multi ? t('Hide Contacts') : t('Hide Contact')}
      isOpen={open}
      handleClose={() => setOpen(false)}
    >
      <DialogContent dividers>
        <Typography>
          {t(
            'Are you sure you wish to hide the selected contact? Hiding a contact in {{appName}} actually sets the contact status to "Never Ask".',
            {
              count: multi ? 2 : 1,
              appName,
            },
          )}
        </Typography>
      </DialogContent>
      <DialogActions>
        <CancelButton onClick={() => setOpen(false)}>{t('No')}</CancelButton>
        <SubmitButton onClick={onConfirm} type="button">
          {t('Yes')}
        </SubmitButton>
      </DialogActions>
    </Modal>
  );
};
