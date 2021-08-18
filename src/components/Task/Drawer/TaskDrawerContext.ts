import { createContext } from 'react';
import { TaskDrawerProviderContext } from './TaskDrawerProvider';

const TaskDrawerContext = createContext<TaskDrawerProviderContext>({
  openTaskDrawer: () => undefined,
  taskDrawers: [],
});

export default TaskDrawerContext;
