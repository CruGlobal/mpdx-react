import React, { ReactElement } from 'react';
import { Box } from '@material-ui/core';
import { MockedProvider } from '@apollo/client/testing';
import {
  GetWeeklyActivityQueryDefaultMocks,
  GetWeeklyActivityQueryLoadingMocks,
} from './WeeklyActivity.mock';
import WeeklyActivity from '.';

export default {
  title: 'Dashboard/ThisWeek/WeeklyActivity',
};

export const Default = (): ReactElement => {
  return (
    <MockedProvider
      mocks={GetWeeklyActivityQueryDefaultMocks()}
      addTypename={false}
    >
      <Box m={2}>
        <WeeklyActivity accountListId="abc" />
      </Box>
    </MockedProvider>
  );
};

export const Loading = (): ReactElement => {
  return (
    <MockedProvider
      mocks={GetWeeklyActivityQueryLoadingMocks()}
      addTypename={false}
    >
      <Box m={2}>
        <WeeklyActivity accountListId="abc" />
      </Box>
    </MockedProvider>
  );
};
