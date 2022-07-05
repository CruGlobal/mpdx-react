import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  styled,
} from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import { useDeleteTaskMutation } from '../../../Task/Drawer/Form/TaskDrawer.generated';
import { GetTasksForTaskListDocument } from '../../../Task/List/TaskList.generated';
import { GetThisWeekDocument } from '../../../Dashboard/ThisWeek/GetThisWeek.generated';
import { ContactTasksTabDocument } from 'src/components/Contacts/ContactDetails/ContactTasksTab/ContactTasksTab.generated';

const LoadingIndicator = styled(CircularProgress)(({ theme }) => ({
  margin: theme.spacing(0, 1, 0, 0),
}));

const ActionButton = styled(Button)(({ theme }) => ({
  color: theme.palette.info.main,
  fontWeight: 550,
}));

interface DeleteConfirmationProps {
  deleteType: string;
  open: boolean;
  deleting?: boolean;
  onClickDecline: (decline: boolean) => void;
  onClickConfirm?: () => void;
  accountListId: string;
  taskId?: string;
  onClose?: () => void;
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
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [deleteTask, { loading: deletingTask }] = useDeleteTaskMutation();

  const onDeleteTask = async (): Promise<void> => {
    if (taskId) {
      const endOfDay = DateTime.local().endOf('day');
      await deleteTask({
        variables: {
          accountListId,
          id: taskId,
        },
        refetchQueries: [
          {
            query: GetTasksForTaskListDocument,
            variables: { accountListId },
          },
          {
            query: ContactTasksTabDocument,
            variables: { accountListId },
          },
          {
            query: GetThisWeekDocument,
            variables: {
              accountListId,
              endOfDay: endOfDay.toISO(),
              today: endOfDay.toISODate(),
              threeWeeksFromNow: endOfDay.plus({ weeks: 3 }).toISODate(),
              twoWeeksAgo: endOfDay.minus({ weeks: 2 }).toISODate(),
            },
          },
        ],
      });
      enqueueSnackbar(t('Task deleted successfully'), { variant: 'success' });
      onClickDecline(false);
      onClose && onClose();
    }
  };

  return (
    <Dialog
      open={open}
      aria-labelledby={t(`Remove ${deleteType} confirmation`)}
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
        <ActionButton onClick={() => onClickDecline(false)}>
          {t('No')}
        </ActionButton>
        <ActionButton
          onClick={deleteType === 'task' ? onDeleteTask : onClickConfirm}
        >
          {t('Yes')}
        </ActionButton>
      </DialogActions>
    </Dialog>
  );
};
