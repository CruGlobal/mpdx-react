import React, { ReactElement } from 'react';
import { TaskCompleteButton } from './TaskCompleteButton';

export default {
  title: 'Contacts/Tab/ContactTasksTab/Row/TaskCompleteButton',
  component: TaskCompleteButton,
};

export const Default = (): ReactElement => {
  return <TaskCompleteButton isComplete={false} onClick={() => {}} />;
};

export const Complete = (): ReactElement => {
  return <TaskCompleteButton isComplete={true} onClick={() => {}} />;
};
