import React, { ReactElement, useState } from 'react';
import { DialogContent, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { TaskCreateInput, TaskUpdateInput } from 'src/graphql/types.generated';
import { useAccountListId } from '../../../hooks/useAccountListId';
import Loading from '../../Loading';
import Modal from '../../common/Modal/Modal';
import { DynamicTaskModalCommentsList } from './Comments/DynamicTaskModalCommentsList';
import { DynamicTaskModalCompleteForm } from './Form/Complete/DynamicTaskModalCompleteForm';
import { DynamicTaskModalForm } from './Form/DynamicTaskModalForm';
import { DynamicTaskModalLogForm } from './Form/LogForm/DynamicTaskModalLogForm';
import { useGetTaskForTaskModalQuery } from './TaskModalTask.generated';

export interface TaskModalProps {
  taskId?: string;
  onClose?: () => void;
  view: 'comments' | 'log' | 'add' | 'complete' | 'edit';
  showCompleteForm?: boolean;
  defaultValues?: Partial<TaskCreateInput & TaskUpdateInput>;
}

export enum TaskModalTabsEnum {
  details = '1',
  contacts = '2',
  comments = '3',
}

const TaskModal = ({
  taskId,
  onClose,
  view,
  defaultValues,
}: TaskModalProps): ReactElement => {
  const accountListId = useAccountListId();
  const [open, setOpen] = useState(!taskId);
  const { t } = useTranslation();
  const { data, loading } = useGetTaskForTaskModalQuery({
    variables: {
      accountListId: accountListId ?? '',
      taskId: taskId ?? '',
      includeComments: view === 'comments',
    },
    skip: !taskId,
    onCompleted: () => setOpen(true),
  });

  const onModalClose = (): void => {
    setOpen(false);
    onClose && onClose();
  };

  const task = data?.task;

  const renderTitle = (): string => {
    switch (view) {
      case 'complete':
        return t('Complete Task');
      case 'comments':
        return t('Task Comments');
      case 'log':
        return t('Log Task');
      case 'edit':
        return t('Edit Task');
      default:
        return t('Add Task');
    }
  };

  const renderView = (): ReactElement => {
    switch (view) {
      case 'complete':
        if (task) {
          return (
            <DynamicTaskModalCompleteForm
              accountListId={accountListId || ''}
              task={task}
              onClose={onModalClose}
            />
          );
        }
      case 'comments':
        return (
          <DynamicTaskModalCommentsList
            accountListId={accountListId || ''}
            taskId={task?.id || ''}
            commentCount={task?.comments?.totalCount}
            onClose={onModalClose}
          />
        );
      case 'log':
        return (
          <DynamicTaskModalLogForm
            accountListId={accountListId || ''}
            onClose={onModalClose}
            defaultValues={defaultValues}
          />
        );
      default:
        return (
          <DynamicTaskModalForm
            accountListId={accountListId || ''}
            task={task}
            onClose={onModalClose}
            defaultValues={defaultValues}
            view={view}
          />
        );
    }
  };

  return loading ? (
    <Loading loading />
  ) : (
    <Modal isOpen={open} title={renderTitle()} handleClose={onModalClose}>
      {accountListId ? (
        renderView()
      ) : (
        <DialogContent dividers>
          <Typography color="error" align="center">
            {t(
              'Our apologies. It appears something has gone wrong. Please try again later and contact the administrator if this problem persists.',
            )}
          </Typography>
        </DialogContent>
      )}
    </Modal>
  );
};

export default TaskModal;
