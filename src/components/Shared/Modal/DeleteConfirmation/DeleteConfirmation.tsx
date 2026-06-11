import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import {
  CancelButton,
  SubmitButton,
} from 'src/components/Shared/Modal/ActionButtons/ActionButtons';
import { LoadingIndicator } from 'src/components/Shared/styledComponents/LoadingStyling';
import { useHaptics } from 'src/hooks/useHaptics';
import { useDeleteTaskMutation } from '../../../Task/Modal/Form/TaskModal.generated';

interface DeleteConfirmationProps {
  deleteType: string;
  open: boolean;
  deleting?: boolean;
  onClickDecline: (decline: boolean) => void;
  onClickConfirm?: () => void;
  accountListId?: string;
  taskId?: string;
  onClose?: () => void;
  removeSelectedIds?: (id: string[]) => void;
}

export const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
  deleteType,
  open,
  deleting,
  onClickConfirm,
  onClickDecline,
  accountListId,
  taskId,
  onClose,
  removeSelectedIds,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { triggerHaptic } = useHaptics();
  const [deleteTask, { loading: deletingTask }] = useDeleteTaskMutation();

  const onDeleteTask = async (): Promise<void> => {
    if (taskId) {
      await deleteTask({
        variables: {
          accountListId: accountListId ?? '',
          id: taskId,
        },
        update: (cache) => {
          cache.evict({ id: `Task:${taskId}` });
          cache.gc();
        },
        refetchQueries: [
          'ContactTasksTab',
          'GetWeeklyActivity',
          'GetThisWeek',
          'Tasks',
        ],
      });
      enqueueSnackbar(t('Task deleted successfully'), { variant: 'success' });
      onClickDecline(false);
      onClose && onClose();
      onClickConfirm && onClickConfirm();
      removeSelectedIds && removeSelectedIds([taskId]);
    }
  };

  const handleConfirm = (): void => {
    // Fire-and-forget; no-op outside the native shell
    triggerHaptic('warning');
    if (taskId) {
      onDeleteTask();
    } else {
      onClickConfirm?.();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => onClickDecline(false)}
      disableRestoreFocus={true}
      aria-labelledby={t('Remove {{deleteType}} confirmation', {
        deleteType,
      })}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>{t('Confirm')}</DialogTitle>
      <DialogContent dividers>
        {deleting || (taskId && deletingTask) ? (
          <LoadingIndicator color="primary" size={50} />
        ) : (
          <DialogContentText>
            {t('Are you sure you wish to delete the selected {{deleteType}}?', {
              deleteType,
            })}
          </DialogContentText>
        )}
      </DialogContent>
      <DialogActions>
        <CancelButton onClick={() => onClickDecline(false)}>
          {t('No')}
        </CancelButton>
        <SubmitButton type="button" onClick={handleConfirm}>
          {t('Yes')}
        </SubmitButton>
      </DialogActions>
    </Dialog>
  );
};
