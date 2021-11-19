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
import { useGetTaskForTaskDrawerQuery } from '../Drawer/TaskDrawerTask.generated';
import TaskModalForm from './Form/TaskModalForm';

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
  showCompleteForm?: boolean;
  specificTab?: TaskDrawerTabsEnum;
  defaultValues?: Partial<Task>;
  filter?: TaskFilter;
  rowsPerPage?: number;
}

export enum TaskDrawerTabsEnum {
  details = '1',
  contacts = '2',
  comments = '3',
}

const TaskModal = ({
  taskId,
  onClose,
  showCompleteForm,
  defaultValues,
  filter,
  rowsPerPage,
}: TaskModalProps): ReactElement => {
  const accountListId = useAccountListId();
  const [open, setOpen] = useState(!taskId);
  const { t } = useTranslation();
  const { data, loading } = useGetTaskForTaskDrawerQuery({
    variables: {
      accountListId: accountListId ?? '',
      taskId: taskId ?? '',
    },
    skip: !taskId,
    onCompleted: () => setOpen(true),
  });

  const onDrawerClose = (): void => {
    setOpen(false);
    onClose && onClose();
  };

  const task = data?.task;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const title = ((): string => {
    if (task) {
      if (task.activityType) {
        if (showCompleteForm) {
          return t('Complete {{activityType}}', {
            activityType: t(task.activityType),
          });
        } else {
          return t(task.activityType);
        }
      } else {
        if (showCompleteForm) {
          return t('Complete {{activityType}}', { activityType: t('Task') });
        } else {
          return t('Task');
        }
      }
    } else {
      return t('Add Task');
    }
  })();

  return (
    <>
      {loading ? (
        <Loading loading />
      ) : (
        <StyledModal open={open} onClose={onDrawerClose}>
          <Card>
            <CardHeader
              title={
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="h6">Add Task</Typography>
                  <IconButton size="small" onClick={onDrawerClose}>
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
                    {!loading && accountListId && (
                      <>
                        {showCompleteForm ? (
                          task && (
                            <TaskDrawerCompleteForm
                              accountListId={accountListId}
                              task={task}
                              onClose={onDrawerClose}
                            />
                          )
                        ) : (
                          <TaskModalForm
                            accountListId={accountListId}
                            task={task} // TODO: Use fragments to ensure all required fields are loaded
                            onClose={onDrawerClose}
                            defaultValues={defaultValues}
                            filter={filter}
                            rowsPerPage={rowsPerPage || 100}
                          />
                        )}
                      </>
                    )}
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
