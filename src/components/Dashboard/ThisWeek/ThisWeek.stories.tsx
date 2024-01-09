import React, { ReactElement } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import withMargin from '../../../decorators/withMargin';
import {
  GetThisWeekDefaultMocks,
  GetThisWeekEmptyMocks,
} from './ThisWeek.mock';
import { GetWeeklyActivityQueryLoadingMocks } from './WeeklyActivity/WeeklyActivity.mock';
import ThisWeek from '.';

export default {
  title: 'Dashboard/ThisWeek',
  decorators: [withMargin],
};

export const Default = (): ReactElement => {
  return (
    <MockedProvider mocks={GetThisWeekDefaultMocks()} addTypename={false}>
      <ThisWeek accountListId="abc" />
    </MockedProvider>
  );
};
export const Empty = (): ReactElement => {
  return (
    <MockedProvider mocks={GetThisWeekEmptyMocks()} addTypename={false}>
      <ThisWeek accountListId="abc" />
    </MockedProvider>
  );
};
export const Loading = (): ReactElement => {
  return (
    <MockedProvider
      mocks={GetWeeklyActivityQueryLoadingMocks()}
      addTypename={false}
    >
      <ThisWeek accountListId="abc" />
    </MockedProvider>
  );
};
