import React, { ReactElement } from 'react';
import { TaskCommentsButton } from './TaskCommentsButton';

export default {
  title: 'Contacts/Tab/ContactTasksTab/Row/TaskCommentsButton',
  component: TaskCommentsButton,
};

export const Default = (): ReactElement => {
  return (
    <TaskCommentsButton
      isComplete={false}
      numberOfComments={3}
      onClick={() => {}}
    />
  );
};

export const Complete = (): ReactElement => {
  return (
    <TaskCommentsButton
      isComplete={true}
      numberOfComments={3}
      onClick={() => {}}
    />
  );
};
