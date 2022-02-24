import { createContext } from 'react';
import { TaskModalProviderContext } from './TaskModalProvider';

const TaskModalContext = createContext<TaskModalProviderContext>({
  openTaskModal: () => undefined,
  taskModal: { id: '' },
});

export default TaskModalContext;
