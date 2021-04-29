import { DateTime } from 'luxon';
import React, { ReactElement } from 'react';
import { TaskDueDate } from './TaskDueDate';

export default {
  title: 'Contacts/Tab/ContactTasksTab/Row/TaskDueDate',
  component: TaskDueDate,
};

const dueDate = DateTime.local(2020, 10, 12);

export const Default = (): ReactElement => {
  return <TaskDueDate isLate={false} isComplete={false} dueDate={dueDate} />;
};

export const Late = (): ReactElement => {
  return <TaskDueDate isLate={true} isComplete={false} dueDate={dueDate} />;
};

export const Complete = (): ReactElement => {
  return <TaskDueDate isLate={false} isComplete={true} dueDate={dueDate} />;
};
