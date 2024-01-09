import { useContext } from 'react';
import TaskModalContext from '../components/Task/Modal/TaskModalContext';
import { TaskModalProviderContext } from '../components/Task/Modal/TaskModalProvider';

const useTaskModal = (): TaskModalProviderContext =>
  useContext(TaskModalContext);

export default useTaskModal;
