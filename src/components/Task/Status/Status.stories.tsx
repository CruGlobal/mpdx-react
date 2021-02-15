import React, { ReactElement } from 'react';
import withMargin from '../../../decorators/withMargin';
import TaskStatus from '.';

export default {
  title: 'Task/Status',
  decorators: [withMargin],
};

export const Default = (): ReactElement => <TaskStatus />;

export const ColorPrimary = (): ReactElement => <TaskStatus color="primary" />;

export const NoDueDate = (): ReactElement => <TaskStatus taskId="abc" />;

export const Due = (): ReactElement => (
  <TaskStatus taskId="abc" startAt="2050-12-31T11:00:00.000Z" />
);

export const Overdue = (): ReactElement => (
  <TaskStatus taskId="abc" startAt="2009-12-31T11:00:00.000Z" />
);

export const Completed = (): ReactElement => (
  <TaskStatus taskId="abc" completedAt="2009-12-31T11:00:00.000Z" />
);

export const TooltipDisabled = (): ReactElement => (
  <TaskStatus disableTooltip />
);
