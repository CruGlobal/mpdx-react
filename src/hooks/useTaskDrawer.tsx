import { useContext } from 'react';
import TaskDrawerContext from '../components/Task/Drawer/TaskDrawerContext';
import { TaskDrawerProviderContext } from '../components/Task/Drawer/TaskDrawerProvider';

const useTaskDrawer = (): TaskDrawerProviderContext =>
  useContext(TaskDrawerContext);

export default useTaskDrawer;
