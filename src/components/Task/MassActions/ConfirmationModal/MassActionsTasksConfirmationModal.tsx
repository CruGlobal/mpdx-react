import React, { useMemo, useState } from 'react';
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
import { Action } from './ActionEnum';

interface MassActionsTasksConfirmationModalProps {
  open: boolean;
  action: Action;
  idsCount: number;
  setOpen: (open: boolean) => void;
  onConfirm: () => void;
}

export const MassActionsTasksConfirmationModal: React.FC<
  MassActionsTasksConfirmationModalProps
> = ({ open, idsCount, action, setOpen, onConfirm }) => {
  const { t } = useTranslation();

  const [hasConfirmedDeletion, setHasConfirmedDeletion] = useState(false);

  const shouldConfirmDeletion = useMemo(() => {
    return action === Action.Delete && idsCount >= 5;
  }, [action, idsCount]);

  const handleChange = () => {
    setHasConfirmedDeletion(!hasConfirmedDeletion);
  };

  return (
    <Modal
      title={
        action === Action.Complete ? t('Complete Tasks') : t('Delete Tasks')
      }
      isOpen={open}
      handleClose={() => setOpen(false)}
    >
      <DialogContent dividers data-testid={'CompleteAndDeleteTasksModal'}>
        {action === Action.Complete || !shouldConfirmDeletion ? (
          <Typography>
            {t(
              'Are you sure you wish to {{action}} the {{count}} selected tasks?',
              { action, count: idsCount },
            )}
          </Typography>
        ) : (
          <Typography>
            <Alert severity="error">
              {t(
                'Deleting these tasks is permanent and cannot be undone. Please make sure you want to permanently delete them before proceeding.',
              )}
            </Alert>
            <FormControlLabel
              control={
                <Checkbox
                  checked={hasConfirmedDeletion}
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
        )}
      </DialogContent>
      <DialogActions>
        <CancelButton onClick={() => setOpen(false)}>{t('No')}</CancelButton>
        <SubmitButton
          disabled={!hasConfirmedDeletion && shouldConfirmDeletion}
          onClick={onConfirm}
          type="button"
        >
          {t('Yes')}
        </SubmitButton>
      </DialogActions>
    </Modal>
  );
};
