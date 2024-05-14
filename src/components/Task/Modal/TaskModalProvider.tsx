import { ReactElement, ReactNode, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import theme from 'src/theme';
import { preloadTaskModalCommentsList } from './Comments/DynamicTaskModalCommentsList';
import { preloadTaskModalCompleteForm } from './Form/Complete/DynamicTaskModalCompleteForm';
import { preloadTaskModalForm } from './Form/DynamicTaskModalForm';
import { preloadTaskModalLogForm } from './Form/LogForm/DynamicTaskModalLogForm';
import TaskModal, { TaskModalProps } from './TaskModal';
import TaskModalContext from './TaskModalContext';

interface Props {
  children: ReactNode;
}

export interface TaskModalProviderContext {
  openTaskModal: (props: TaskModalProps) => void;
  preloadTaskModal: (view: TaskModalProps['view']) => void;
  taskModals: TaskModalPropsWithId[];
}

interface TaskModalPropsWithId extends TaskModalProps {
  id: string;
}

const TaskModalProvider = ({ children }: Props): ReactElement => {
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
  const preloadTaskModal = (view: TaskModalProps['view']) => {
    if (view === 'complete') {
      preloadTaskModalCompleteForm();
    } else if (view === 'comments') {
      preloadTaskModalCommentsList();
    } else if (view === 'log') {
      preloadTaskModalLogForm();
    } else {
      preloadTaskModalForm();
    }
  };
  const value: TaskModalProviderContext = {
    openTaskModal,
    preloadTaskModal,
    taskModals,
  };

  return (
    <TaskModalContext.Provider value={value}>
      {children}
      {taskModals.map((props: TaskModalPropsWithId) => {
        const { id, ...taskModalProps } = props;

        return <TaskModal key={id} {...taskModalProps} />;
      })}
    </TaskModalContext.Provider>
  );
};

export default TaskModalProvider;
