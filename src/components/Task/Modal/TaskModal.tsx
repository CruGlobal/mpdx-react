import React, { ReactElement, useMemo, useState } from 'react';
import { CheckCircle } from '@mui/icons-material';
import { DialogContent, Slide, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { TransitionProps } from '@mui/material/transitions';
import { useTranslation } from 'react-i18next';
import {
  PhaseEnum,
  StatusEnum,
  TaskCreateInput,
  TaskUpdateInput,
} from 'src/graphql/types.generated';
import { useAccountListId } from '../../../hooks/useAccountListId';
import Loading from '../../Loading';
import Modal from '../../common/Modal/Modal';
import { DynamicTaskModalCommentsList } from './Comments/DynamicTaskModalCommentsList';
import { DynamicTaskModalCompleteForm } from './Form/Complete/DynamicTaskModalCompleteForm';
import { DynamicTaskModalForm } from './Form/DynamicTaskModalForm';
import { DynamicTaskModalLogForm } from './Form/LogForm/DynamicTaskModalLogForm';
import { useGetTaskForTaskModalQuery } from './TaskModalTask.generated';

export enum TaskModalEnum {
  Comments = 'comments',
  Log = 'log',
  Add = 'add',
  Complete = 'complete',
  Edit = 'edit',
}
export interface TaskModalProps {
  taskId?: string;
  onClose?: () => void;
  view: TaskModalEnum;
  showCompleteForm?: boolean;
  defaultValues?: Partial<TaskCreateInput & TaskUpdateInput> & {
    taskPhase?: PhaseEnum;
    contactNodes?: [
      {
        id: string;
        status: StatusEnum | undefined;
      },
    ];
  };
  showFlowsMessage?: boolean;
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
  return <Slide direction="up" unmountOnExit ref={ref} {...props} />;
});

const TaskModal = ({
  taskId,
  onClose,
  view,
  defaultValues,
  showFlowsMessage,
}: TaskModalProps): ReactElement => {
  const accountListId = useAccountListId();
  const [open, setOpen] = useState(!taskId);
  const { t } = useTranslation();
  const { data, loading } = useGetTaskForTaskModalQuery({
    variables: {
      accountListId: accountListId ?? '',
      taskId: taskId ?? '',
      includeComments: view === TaskModalEnum.Comments,
    },
    skip: !taskId,
    onCompleted: () => setOpen(true),
  });

  const onModalClose = (): void => {
    setOpen(false);
    onClose && onClose();
  };

  const task = data?.task;

  const renderTitle = useMemo((): string | ReactElement => {
    switch (view) {
      case TaskModalEnum.Complete:
        return (
          <>
            <StyledCheckIcon />
            {t('Complete Task')}
          </>
        );
      case TaskModalEnum.Comments:
        return t('Task Comments');
      case 'log':
        return (
          <>
            <StyledCheckIcon />
            {t('Log Task')}
          </>
        );
      case TaskModalEnum.Edit:
        return t('Edit Task');
      default:
        return t('Add Task');
    }
  }, [view]);

  return loading ? (
    <Loading loading />
  ) : (
    <Modal
      isOpen={open}
      title={renderTitle}
      handleClose={onModalClose}
      transition={Transition}
      altColors={view === 'log' || view === 'complete'}
    >
      {accountListId ? (
        <>
          {view === TaskModalEnum.Complete && task && (
            <DynamicTaskModalCompleteForm
              accountListId={accountListId}
              task={task}
              onClose={onModalClose}
              showFlowsMessage={showFlowsMessage}
            />
          )}
          {view === TaskModalEnum.Comments && (
            <DynamicTaskModalCommentsList
              accountListId={accountListId}
              taskId={task?.id || ''}
              commentCount={task?.comments?.totalCount}
              onClose={onModalClose}
            />
          )}
          {view === TaskModalEnum.Log && (
            <DynamicTaskModalLogForm
              accountListId={accountListId}
              onClose={onModalClose}
              defaultValues={defaultValues}
              showFlowsMessage={showFlowsMessage}
            />
          )}
          {[
            TaskModalEnum.Complete,
            TaskModalEnum.Comments,
            TaskModalEnum.Log,
          ].indexOf(view) === -1 && (
            <DynamicTaskModalForm
              accountListId={accountListId}
              task={task}
              onClose={onModalClose}
              defaultValues={defaultValues}
              view={view}
              showFlowsMessage={showFlowsMessage}
            />
          )}
        </>
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
