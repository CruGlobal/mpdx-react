import React, { ReactElement } from 'react';
import { Box } from '@material-ui/core';
import { AppProvider } from '../../App';
import TaskStatus from '.';

export default {
    title: 'Task/Status',
    decorators: [
        (Story): ReactElement => (
            <Box m={2}>
                <AppProvider>
                    <Story />
                </AppProvider>
            </Box>
        ),
    ],
};

export const Default = (): ReactElement => <TaskStatus />;

export const ColorPrimary = (): ReactElement => <TaskStatus color="primary" />;

export const NoDueDate = (): ReactElement => <TaskStatus taskId="abc" />;

export const Due = (): ReactElement => <TaskStatus taskId="abc" startAt="2050-12-31T11:00:00.000Z" />;

export const Overdue = (): ReactElement => <TaskStatus taskId="abc" startAt="2009-12-31T11:00:00.000Z" />;

export const Completed = (): ReactElement => <TaskStatus taskId="abc" completedAt="2009-12-31T11:00:00.000Z" />;

export const TooltipDisabled = (): ReactElement => <TaskStatus disableTooltip />;
