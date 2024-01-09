import React, { ReactElement } from 'react';
import { DateTime } from 'luxon';
import { TaskDate } from './TaskDate';

export default {
  title: 'Contacts/Tab/ContactTasksTab/Row/TaskDate',
  component: TaskDate,
};

const notLateDueDate = DateTime.local(2021, 10, 12);
const lateDueDate = DateTime.local(2019, 10, 12);
const currentDate = DateTime.local(2020, 10, 12);

export const Default = (): ReactElement => {
  return <TaskDate isComplete={false} taskDate={notLateDueDate} />;
};

export const Late = (): ReactElement => {
  return <TaskDate isComplete={false} taskDate={lateDueDate} />;
};

export const Complete = (): ReactElement => {
  return <TaskDate isComplete={true} taskDate={notLateDueDate} />;
};
export const CompletedInCurrentYear = (): ReactElement => {
  return <TaskDate isComplete={true} taskDate={currentDate} />;
};
