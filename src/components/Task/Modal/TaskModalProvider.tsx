import { ReactElement, ReactNode, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import TaskModal, { TaskModalProps } from '../Modal/TaskModal';
import TaskModalContext from './TaskModalContext';

interface Props {
  children: ReactNode;
}

export interface TaskModalProviderContext {
  openTaskModal: (props: TaskModalProps) => void;
  taskModal: TaskModalPropsWithId;
}

interface TaskModalPropsWithId extends TaskModalProps {
  id: string;
}

const TaskModalProvider = ({ children }: Props): ReactElement => {
  const [taskModal, setTaskModal] = useState<TaskModalPropsWithId>({ id: '' });
  const openTaskModal = (taskModalProps: TaskModalProps): void => {
    const id = uuidv4();
    if (
      !taskModalProps.taskId ||
      !(
        taskModal.taskId === taskModalProps.taskId &&
        taskModal.showCompleteForm === taskModalProps.showCompleteForm
      )
    ) {
      setTaskModal({
        id,
        ...taskModalProps,
        onClose: (): void => {
          taskModalProps.onClose && taskModalProps.onClose();
          setTaskModal({ id: '' });
        },
      });
    }
  };
  const value: TaskModalProviderContext = {
    openTaskModal,
    taskModal,
  };

  return (
    <TaskModalContext.Provider value={value}>
      {children}
      {taskModal.id && (
        <TaskModal
          taskId={taskModal.taskId}
          onClose={taskModal.onClose}
          view={taskModal.view}
          showCompleteForm={taskModal.showCompleteForm}
          defaultValues={taskModal.defaultValues}
          filter={taskModal.filter}
          rowsPerPage={taskModal.rowsPerPage}
        />
      )}
    </TaskModalContext.Provider>
  );
};

export default TaskModalProvider;
