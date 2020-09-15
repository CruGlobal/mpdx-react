import React, { ReactElement } from 'react';
import { Box } from '@material-ui/core';
import { MockedProvider } from '@apollo/client/testing';
import { GetThisWeekQuery_dueTasks, GetThisWeekQuery_dueTasks_nodes } from '../../../../../types/GetThisWeekQuery';
import { ActivityTypeEnum } from '../../../../../types/globalTypes';
import TasksDueThisWeek from '.';

export default {
    title: 'Dashboard/ThisWeek/TasksDueThisWeek',
};

export const Default = (): ReactElement => {
    const task: GetThisWeekQuery_dueTasks_nodes = {
        id: 'task',
        subject: 'the quick brown fox jumps over the lazy dog',
        activityType: ActivityTypeEnum.PRAYER_REQUEST,
        contacts: { nodes: [{ name: 'Smith, Roger' }] },
        startAt: null,
        completedAt: null,
    };

    const dueTasks: GetThisWeekQuery_dueTasks = {
        nodes: [
            { ...task, id: 'task_1' },
            { ...task, id: 'task_2' },
            { ...task, id: 'task_3' },
        ],
        totalCount: 5,
    };
    return (
        <Box m={2}>
            <MockedProvider mocks={[]} addTypename={false}>
                <TasksDueThisWeek loading={false} dueTasks={dueTasks} />
            </MockedProvider>
        </Box>
    );
};

export const Empty = (): ReactElement => {
    const dueTasks: GetThisWeekQuery_dueTasks = {
        nodes: [],
        totalCount: 0,
    };
    return (
        <Box m={2}>
            <MockedProvider mocks={[]} addTypename={false}>
                <TasksDueThisWeek loading={false} dueTasks={dueTasks} />
            </MockedProvider>
        </Box>
    );
};

export const Loading = (): ReactElement => {
    return (
        <Box m={2}>
            <MockedProvider mocks={[]} addTypename={false}>
                <TasksDueThisWeek loading={true} />
            </MockedProvider>
        </Box>
    );
};
