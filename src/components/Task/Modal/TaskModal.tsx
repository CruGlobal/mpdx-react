import React, { ReactElement, useState } from 'react';
import { DialogContent, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Modal from '../../common/Modal/Modal';
import Loading from '../../Loading';
import {
  TaskCreateInput,
  TaskUpdateInput,
} from '../../../../graphql/types.generated';
import { useAccountListId } from '../../../hooks/useAccountListId';
import { useGetTaskForTaskModalQuery } from '../Modal/TaskModalTask.generated';
import TaskModalForm from './Form/TaskModalForm';
import TaskModalCompleteForm from './Form/Complete/TaskModalCompleteForm';
import TaskModalCommentsList from './Comments/TaskModalCommentsList';
import TaskModalLogForm from './Form/LogForm/TaskModalLogForm';

export interface TaskModalProps {
  taskId?: string;
  onClose?: () => void;
  view?: 'comments' | 'log' | 'add' | 'complete' | 'edit';
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
            <TaskModalCompleteForm
              accountListId={accountListId || ''}
              task={task}
              onClose={onModalClose}
            />
          );
        }
      case 'comments':
        return (
          <TaskModalCommentsList
            accountListId={accountListId || ''}
            taskId={task?.id || ''}
            onClose={onModalClose}
          />
        );
      case 'log':
        return (
          <TaskModalLogForm
            accountListId={accountListId || ''}
            task={task}
            onClose={onModalClose}
            defaultValues={defaultValues}
          />
        );
      default:
        return (
          <TaskModalForm
            accountListId={accountListId || ''}
            task={task}
            onClose={onModalClose}
            defaultValues={defaultValues}
            view={view}
          />
        );
    }
  };

  return (
    <>
      {loading ? (
        <Loading loading />
      ) : (
        <Modal isOpen={open} title={renderTitle()} handleClose={onModalClose}>
          {accountListId ? (
            <>{renderView()}</>
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
      )}
    </>
  );
};

export default TaskModal;
