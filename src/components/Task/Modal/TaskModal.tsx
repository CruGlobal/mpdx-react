import React, { ReactElement, useState } from 'react';
import { CheckCircle } from '@mui/icons-material';
import { DialogContent, Slide, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { TransitionProps } from '@mui/material/transitions';
import { useTranslation } from 'react-i18next';
import {
  PhaseEnum,
  TaskCreateInput,
  TaskUpdateInput,
} from 'src/graphql/types.generated';
import { useAccountListId } from '../../../hooks/useAccountListId';
import Loading from '../../Loading';
import Modal from '../../common/Modal/Modal';
import { TaskModalCommentsList } from './Comments/TaskModalCommentsList';
import TaskModalCompleteForm from './Form/Complete/TaskModalCompleteForm';
import TaskModalLogForm from './Form/LogForm/TaskModalLogForm';
import TaskModalForm from './Form/TaskModalForm';
import { useGetTaskForTaskModalQuery } from './TaskModalTask.generated';

export interface TaskModalProps {
  taskId?: string;
  onClose?: () => void;
  view: 'comments' | 'log' | 'add' | 'complete' | 'edit';
  showCompleteForm?: boolean;
  defaultValues?: Partial<TaskCreateInput & TaskUpdateInput> & {
    taskPhase?: PhaseEnum;
  };
}

const StyledCheckIcon = styled(CheckCircle)(({ theme }) => ({
  color: theme.palette.mpdxGreen.main,
}));

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

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

  const renderTitle = (): string | ReactElement => {
    switch (view) {
      case 'complete':
        return (
          <>
            <StyledCheckIcon />
            {t('Complete Task')}
          </>
        );
      case 'comments':
        return t('Task Comments');
      case 'log':
        return (
          <>
            <StyledCheckIcon />
            {t('Log Task')}
          </>
        );
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
            commentCount={task?.comments?.totalCount}
            onClose={onModalClose}
          />
        );
      case 'log':
        return (
          <TaskModalLogForm
            accountListId={accountListId || ''}
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

  return loading ? (
    <Loading loading />
  ) : (
    <Modal
      isOpen={open}
      title={renderTitle()}
      handleClose={onModalClose}
      transition={Transition}
      altColors={view === 'log' || view === 'complete'}
    >
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
