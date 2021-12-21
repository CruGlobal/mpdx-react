import { ReactElement, ReactNode, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import theme from '../../../theme';
import TaskDrawer, { TaskDrawerProps } from './Drawer';
import TaskDrawerContext from './TaskDrawerContext';

interface Props {
  children: ReactNode;
}

export interface TaskDrawerProviderContext {
  openTaskDrawer: (props: TaskDrawerProps) => void;
  taskDrawers: TaskDrawerPropsWithId[];
}

interface TaskDrawerPropsWithId extends TaskDrawerProps {
  id: string;
}

const TaskDrawerProvider = ({ children }: Props): ReactElement => {
  const [taskDrawers, setTaskDrawers] = useState<TaskDrawerPropsWithId[]>([]);
  const openTaskDrawer = (taskDrawerProps: TaskDrawerProps): void => {
    const id = uuidv4();
    if (
      !taskDrawerProps.taskId ||
      !taskDrawers.find(
        ({ taskId, showCompleteForm }) =>
          taskId === taskDrawerProps.taskId &&
          showCompleteForm === taskDrawerProps.showCompleteForm,
      )
    ) {
      setTaskDrawers([
        ...taskDrawers,
        {
          id,
          ...taskDrawerProps,
          onClose: (): void => {
            taskDrawerProps.onClose && taskDrawerProps.onClose();
            setTimeout(
              () =>
                setTaskDrawers((taskDrawers) =>
                  taskDrawers.filter(({ id: taskId }) => taskId !== id),
                ),
              theme.transitions.duration.leavingScreen,
            );
          },
        },
      ]);
    }
  };
  const value: TaskDrawerProviderContext = {
    openTaskDrawer,
    taskDrawers,
  };

  return (
    <TaskDrawerContext.Provider value={value}>
      {children}
      {taskDrawers.map((props: TaskDrawerPropsWithId) => {
        const { id, ...taskDrawerProps } = props;

        return <TaskDrawer key={id} {...taskDrawerProps} />;
      })}
    </TaskDrawerContext.Provider>
  );
};

export default TaskDrawerProvider;
