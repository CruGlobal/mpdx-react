import React, { ReactElement, useState } from 'react';
import {
  IconButton,
  Box,
  Modal,
  Typography,
  styled,
  Card,
  CardHeader,
  CardContent,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { useTranslation } from 'react-i18next';

import { AnimatePresence, motion } from 'framer-motion';
import Loading from '../../Loading';
import { Task } from '../../../../graphql/types.generated';
import { TaskFilter } from '../List/List';
import { useAccountListId } from '../../../hooks/useAccountListId';
import TaskDrawerCompleteForm from '../Drawer/CompleteForm';
import { useGetTaskForTaskModalQuery } from '../Modal/TaskModalTask.generated';
import TaskModalForm from './Form/TaskModalForm';
import TaskModalCommentsList from './Comments/TaskModalCommentsList';
import TaskModalLogForm from './Form/LogForm/TaskModalLogForm';

const StyledModal = styled(Modal)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'auto',
}));

export interface TaskModalProps {
  taskId?: string;
  onClose?: () => void;
  view?: string;
  showCompleteForm?: boolean;
  defaultValues?: Partial<Task>;
  filter?: TaskFilter;
  rowsPerPage?: number;
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
  filter,
  rowsPerPage,
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
      case 'comments':
        return 'Task Comments';
      case 'log':
        return 'Log Task';
      default:
        return 'Add Task';
    }
  };

  const renderView = (): ReactElement => {
    switch (view) {
      case 'complete':
        if (task) {
          return (
            <TaskDrawerCompleteForm
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
            filter={filter}
            rowsPerPage={rowsPerPage || 100}
          />
        );
      default:
        return (
          <TaskModalForm
            accountListId={accountListId || ''}
            task={task}
            onClose={onModalClose}
            defaultValues={defaultValues}
            filter={filter}
            rowsPerPage={rowsPerPage || 100}
          />
        );
    }
  };

  return (
    <>
      {loading ? (
        <Loading loading />
      ) : (
        <StyledModal open={open} onClose={onModalClose}>
          <Card>
            <CardHeader
              title={
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="h6">{renderTitle()}</Typography>
                  <IconButton size="small" onClick={onModalClose}>
                    <CloseIcon titleAccess={t('Close')} />
                  </IconButton>
                </Box>
              }
            />
            <CardContent style={{ padding: 0 }}>
              <Box display="flex" justifyContent="center">
                <AnimatePresence initial={false}>
                  <motion.div
                    initial={{ x: 300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -300, opacity: 0 }}
                  >
                    {!loading && accountListId && <>{renderView()}</>}
                  </motion.div>
                </AnimatePresence>
              </Box>
            </CardContent>
          </Card>
        </StyledModal>
      )}
    </>
  );
};

export default TaskModal;
