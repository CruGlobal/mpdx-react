import { createContext } from 'react';
import { TaskModalProviderContext } from './TaskModalProvider';

const TaskModalContext = createContext<TaskModalProviderContext>({
  openTaskModal: () => undefined,
  taskModals: [],
});

export default TaskModalContext;
