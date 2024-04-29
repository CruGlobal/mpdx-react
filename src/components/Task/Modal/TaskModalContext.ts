import { createContext } from 'react';
import { TaskModalProviderContext } from './TaskModalProvider';

const TaskModalContext = createContext<TaskModalProviderContext>({
  openTaskModal: () => undefined,
  preloadTaskModal: () => undefined,
  taskModals: [],
});

export default TaskModalContext;
