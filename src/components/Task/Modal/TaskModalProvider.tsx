import { ReactElement, ReactNode, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import theme from '../../../theme';
import TaskModal, { TaskModalProps } from '../Modal/TaskModal';
import TaskDrawerContext from './TaskModalContext';

interface Props {
  children: ReactNode;
}

export interface TaskModalProviderContext {
  openTaskModal: (props: TaskModalProps) => void;
  taskModals: TaskModalPropsWithId[];
}

interface TaskModalPropsWithId extends TaskModalProps {
  id: string;
}

const TaskDrawerProvider = ({ children }: Props): ReactElement => {
  const [taskModals, setTaskModals] = useState<TaskModalPropsWithId[]>([]);
  const openTaskModal = (taskModalProps: TaskModalProps): void => {
    const id = uuidv4();
    if (
      !taskModalProps.taskId ||
      !taskModals.find(
        ({ taskId, showCompleteForm }) =>
          taskId === taskModalProps.taskId &&
          showCompleteForm === taskModalProps.showCompleteForm,
      )
    ) {
      setTaskModals([
        ...taskModals,
        {
          id,
          ...taskModalProps,
          onClose: (): void => {
            taskModalProps.onClose && taskModalProps.onClose();
            setTimeout(
              () =>
                setTaskModals((taskModals) =>
                  taskModals.filter(({ id: taskId }) => taskId !== id),
                ),
              theme.transitions.duration.leavingScreen,
            );
          },
        },
      ]);
    }
  };
  const value: TaskModalProviderContext = {
    openTaskModal,
    taskModals,
  };

  return (
    <TaskDrawerContext.Provider value={value}>
      {children}
      {taskModals.map((props: TaskModalPropsWithId) => {
        const { id, ...taskModalProps } = props;

        return <TaskModal key={id} {...taskModalProps} />;
      })}
    </TaskDrawerContext.Provider>
  );
};

export default TaskDrawerProvider;
