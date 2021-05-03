import { DateTime } from 'luxon';
import React, { ReactElement } from 'react';
import { TaskDueDate } from './TaskDueDate';

export default {
  title: 'Contacts/Tab/ContactTasksTab/Row/TaskDueDate',
  component: TaskDueDate,
};

const notLateDueDate = DateTime.local(2021, 10, 12);
const lateDueDate = DateTime.local(2019, 10, 12);

export const Default = (): ReactElement => {
  return <TaskDueDate isComplete={false} dueDate={notLateDueDate} />;
};

export const Late = (): ReactElement => {
  return <TaskDueDate isComplete={false} dueDate={lateDueDate} />;
};

export const Complete = (): ReactElement => {
  return <TaskDueDate isComplete={true} dueDate={notLateDueDate} />;
};
