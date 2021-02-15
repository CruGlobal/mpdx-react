import moment from 'moment';
import { MockedResponse } from '@apollo/client/testing';
import { GetWeeklyActivityQuery } from '../../../../../types/GetWeeklyActivityQuery';
import { GET_WEEKLY_ACTIVITY_QUERY } from './WeeklyActivity';

const data: GetWeeklyActivityQuery = {
  completedCalls: { totalCount: 1234 },
  callsThatProducedAppointments: { totalCount: 5678 },
  completedMessages: { totalCount: 9012 },
  messagesThatProducedAppointments: { totalCount: 3456 },
  completedAppointments: { totalCount: 7890 },
  completedCorrespondence: { totalCount: 1234 },
};
const dataPreviousWeek: GetWeeklyActivityQuery = {
  completedCalls: { totalCount: 5678 },
  callsThatProducedAppointments: { totalCount: 9012 },
  completedMessages: { totalCount: 3456 },
  messagesThatProducedAppointments: { totalCount: 7890 },
  completedAppointments: { totalCount: 1234 },
  completedCorrespondence: { totalCount: 5678 },
};

export const GetWeeklyActivityQueryDefaultMocks = (
  startOfWeek = new Date(),
  endOfWeek = new Date(),
): MockedResponse[] => {
  return [
    {
      request: {
        query: GET_WEEKLY_ACTIVITY_QUERY,
        variables: {
          accountListId: 'abc',
          startOfWeek: moment(startOfWeek).startOf('week').toISOString(),
          endOfWeek: moment(endOfWeek).endOf('week').toISOString(),
        },
      },
      result: {
        data,
      },
    },
    {
      request: {
        query: GET_WEEKLY_ACTIVITY_QUERY,
        variables: {
          accountListId: 'abc',
          startOfWeek: moment(startOfWeek)
            .startOf('week')
            .subtract(1, 'week')
            .toISOString(),
          endOfWeek: moment(endOfWeek)
            .endOf('week')
            .subtract(1, 'week')
            .toISOString(),
        },
      },
      result: {
        data: dataPreviousWeek,
      },
    },
    {
      request: {
        query: GET_WEEKLY_ACTIVITY_QUERY,
        variables: {
          accountListId: 'abc',
          startOfWeek: moment(startOfWeek).startOf('week').toISOString(),
          endOfWeek: moment(endOfWeek).endOf('week').toISOString(),
        },
      },
      result: {
        data,
      },
    },
  ];
};

const emptyData: GetWeeklyActivityQuery = {
  completedCalls: { totalCount: 0 },
  callsThatProducedAppointments: { totalCount: 0 },
  completedMessages: { totalCount: 0 },
  messagesThatProducedAppointments: { totalCount: 0 },
  completedAppointments: { totalCount: 0 },
  completedCorrespondence: { totalCount: 0 },
};

export const GetWeeklyActivityQueryEmptyMocks = (
  startOfWeek = new Date(),
  endOfWeek = new Date(),
): MockedResponse[] => {
  return [
    {
      request: {
        query: GET_WEEKLY_ACTIVITY_QUERY,
        variables: {
          accountListId: 'abc',
          startOfWeek: moment(startOfWeek).startOf('week').toISOString(),
          endOfWeek: moment(endOfWeek).endOf('week').toISOString(),
        },
      },
      result: {
        data: emptyData,
      },
    },
  ];
};

export const GetWeeklyActivityQueryLoadingMocks = (
  startOfWeek = new Date(),
  endOfWeek = new Date(),
): MockedResponse[] => {
  return [
    {
      ...GetWeeklyActivityQueryDefaultMocks(startOfWeek, endOfWeek)[0],
      delay: 100931731455,
    },
  ];
};
