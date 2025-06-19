import React, { useState } from 'react';
import {
  Alert,
  Checkbox,
  DialogActions,
  DialogContent,
  FormControlLabel,
  Typography,
} from '@mui/material';
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

  // KG: useState for checkbox
  const [checked, setChecked] = useState(false);

  const shouldConfirmDeletion = action === 'delete' && idsCount > 5;

  const handleChange = (event) => {
    setChecked(event.target.checked);
  };

  // KG: get correct task message based on action
  function renderMessage() {
    if (action === 'complete' || !shouldConfirmDeletion) {
      return (
        <Typography>
          {t(
            'Are you sure you wish to {{action}} the {{count}} selected tasks?',
            { action, count: idsCount },
          )}
        </Typography>
      );
    } else {
      return (
        <Typography>
          <Alert severity="error">
            {t(
              'Deleting these tasks is permanent and cannot be undone. Please make sure you want to permanently delete them before proceeding.',
            )}
          </Alert>
          <FormControlLabel
            control={
              <Checkbox
                //color="error"
                checked={checked}
                onChange={handleChange}
                inputProps={{ 'aria-label': 'controlled' }}
              />
            }
            label={t(
              'Yes, I want to {{action}} the {{count}} selected tasks.',
              { action, count: idsCount },
            )}
            data-testid="confirmDeletionCheckbox"
          />
        </Typography>
      );
    }
  }

  return (
    <Modal
      title={action === 'complete' ? t('Complete Tasks') : t('Delete Tasks')}
      isOpen={open}
      handleClose={() => setOpen(false)}
    >
      <DialogContent dividers data-testid={'CompleteAndDeleteTasksModal'}>
        {renderMessage()}
      </DialogContent>
      <DialogActions>
        <CancelButton onClick={() => setOpen(false)}>{t('No')}</CancelButton>
        <SubmitButton
          disabled={!checked && shouldConfirmDeletion}
          //color="error"
          onClick={onConfirm}
          type="button"
        >
          {t('Yes')}
        </SubmitButton>
      </DialogActions>
    </Modal>
  );
};
