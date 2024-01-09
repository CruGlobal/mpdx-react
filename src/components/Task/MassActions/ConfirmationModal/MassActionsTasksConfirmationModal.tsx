import React from 'react';
import { DialogActions, DialogContent, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  CancelButton,
  SubmitButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import Modal from '../../../common/Modal/Modal';

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
      <DialogContent dividers data-testid={'CompleteAndDeleteTasksModal'}>
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
