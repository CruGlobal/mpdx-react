import { DialogActions, DialogContent, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../../../common/Modal/Modal';
import {
  SubmitButton,
  CancelButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';

interface MassActionsTasksConfirmationModalProps {
  open: boolean;
  action: 'complete' | 'delete';
  idsCount: number;
  setOpen: (open: boolean) => void;
  onConfirm: () => void;
}

export const MassActionsTasksConfirmationModal: React.FC<
  MassActionsTasksConfirmationModalProps
> = ({ open, idsCount, action, setOpen, onConfirm }) => {
  const { t } = useTranslation();

  return (
    <Modal
      title={action === 'complete' ? t('Complete Tasks') : t('Delete Tasks')}
      isOpen={open}
      handleClose={() => setOpen(false)}
    >
      <DialogContent dividers>
        <Typography>
          {t(
            'Are you sure you wish to {{action}} the {{count}} selected tasks?',
            { action, count: idsCount },
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
