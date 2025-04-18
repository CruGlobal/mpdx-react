import React from 'react';
import {
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import {
  CancelButton,
  SubmitButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import { useDeleteTaskMutation } from '../../../Task/Modal/Form/TaskModal.generated';

const LoadingIndicator = styled(CircularProgress)(({ theme }) => ({
  margin: theme.spacing(0, 1, 0, 0),
}));

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
        <SubmitButton
          type="button"
          onClick={taskId ? onDeleteTask : onClickConfirm}
        >
          {t('Yes')}
        </SubmitButton>
      </DialogActions>
    </Dialog>
  );
};
