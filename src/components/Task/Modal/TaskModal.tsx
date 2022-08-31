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
  useMediaQuery,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';

import { AnimatePresence, motion } from 'framer-motion';
import Loading from '../../Loading';
import {
  TaskCreateInput,
  TaskUpdateInput,
} from '../../../../graphql/types.generated';
import { TaskFilter } from '../List/List';
import { useAccountListId } from '../../../hooks/useAccountListId';
import { useGetTaskForTaskModalQuery } from '../Modal/TaskModalTask.generated';
import TaskModalForm from './Form/TaskModalForm';
import TaskModalCompleteForm from './Form/Complete/TaskModalCompleteForm';
import TaskModalCommentsList from './Comments/TaskModalCommentsList';
import TaskModalLogForm from './Form/LogForm/TaskModalLogForm';
import theme from 'src/theme';

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
  view?: 'comments' | 'log' | 'add' | 'complete' | 'edit';
  showCompleteForm?: boolean;
  defaultValues?: Partial<TaskCreateInput & TaskUpdateInput>;
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
  const smallScreen = useMediaQuery(theme.breakpoints.down('sm'));
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
          <Card style={{ width: smallScreen ? '100%' : 480 }}>
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
