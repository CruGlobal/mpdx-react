import React, { ReactElement } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { Box } from '@mui/material';
import { ActivityTypeEnum } from 'src/graphql/types.generated';
import { GetThisWeekQuery } from '../GetThisWeek.generated';
import TasksDueThisWeek from '.';

export default {
  title: 'Dashboard/ThisWeek/TasksDueThisWeek',
};

export const Default = (): ReactElement => {
  const task: GetThisWeekQuery['dueTasks']['nodes'][0] = {
    id: 'task',
    subject: 'the quick brown fox jumps over the lazy dog',
    activityType: ActivityTypeEnum.PartnerCarePrayerRequest,
    contacts: { nodes: [{ id: '1', name: 'Smith, Roger' }], totalCount: 1 },
    startAt: null,
    completedAt: null,
  };

  const dueTasks: GetThisWeekQuery['dueTasks'] = {
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
        <TasksDueThisWeek
          loading={false}
          dueTasks={dueTasks}
          accountListId="abc"
        />
      </MockedProvider>
    </Box>
  );
};

export const Empty = (): ReactElement => {
  const dueTasks: GetThisWeekQuery['dueTasks'] = {
    nodes: [],
    totalCount: 0,
  };
  return (
    <Box m={2}>
      <MockedProvider mocks={[]} addTypename={false}>
        <TasksDueThisWeek
          loading={false}
          dueTasks={dueTasks}
          accountListId="abc"
        />
      </MockedProvider>
    </Box>
  );
};

export const Loading = (): ReactElement => {
  return (
    <Box m={2}>
      <MockedProvider mocks={[]} addTypename={false}>
        <TasksDueThisWeek loading={true} accountListId="abc" />
      </MockedProvider>
    </Box>
  );
};
