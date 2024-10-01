import { MockedResponse } from '@apollo/client/testing';
import { DateTime, Interval } from 'luxon';
import {
  GetWeeklyActivityDocument,
  GetWeeklyActivityQuery,
} from './GetWeeklyActivity.generated';

const data: GetWeeklyActivityQuery = {
  completedInitiations: { totalCount: 1234 },
  callsThatProducedAppointments: { totalCount: 5678 },
  completedFollowUps: { totalCount: 9012 },
  messagesThatProducedAppointments: { totalCount: 3456 },
  completedAppointments: { totalCount: 7890 },
  completedPartnerCare: { totalCount: 1234 },
};
const dataPreviousWeek: GetWeeklyActivityQuery = {
  completedInitiations: { totalCount: 5678 },
  callsThatProducedAppointments: { totalCount: 9012 },
  completedFollowUps: { totalCount: 3456 },
  messagesThatProducedAppointments: { totalCount: 7890 },
  completedAppointments: { totalCount: 1234 },
  completedPartnerCare: { totalCount: 5678 },
};

export const GetWeeklyActivityQueryDefaultMocks = (): MockedResponse[] => {
  const weekInterval = Interval.fromDateTimes(
    DateTime.local().set({ localWeekday: 1 }),
    DateTime.local().set({ localWeekday: 7 }),
  );
  if (!weekInterval.isValid) {
    throw new Error(`Invalid interval: ${weekInterval.invalidReason}`);
  }

  return [
    {
      request: {
        query: GetWeeklyActivityDocument,
        variables: {
          accountListId: 'abc',
          startOfWeek: weekInterval.start.toISO(),
          endOfWeek: weekInterval.end.toISO(),
        },
      },
      result: {
        data,
      },
    },
    {
      request: {
        query: GetWeeklyActivityDocument,
        variables: {
          accountListId: 'abc',
          startOfWeek: weekInterval.start.minus({ weeks: 1 }).toISO(),
          endOfWeek: weekInterval.end.minus({ weeks: 1 }).toISO(),
        },
      },
      result: {
        data: dataPreviousWeek,
      },
    },
    {
      request: {
        query: GetWeeklyActivityDocument,
        variables: {
          accountListId: 'abc',
          startOfWeek: weekInterval.start.toISO(),
          endOfWeek: weekInterval.end.toISO(),
        },
      },
      result: {
        data,
      },
    },
  ];
};

const emptyData: GetWeeklyActivityQuery = {
  completedInitiations: { totalCount: 0 },
  callsThatProducedAppointments: { totalCount: 0 },
  completedFollowUps: { totalCount: 0 },
  messagesThatProducedAppointments: { totalCount: 0 },
  completedAppointments: { totalCount: 0 },
  completedPartnerCare: { totalCount: 0 },
};

export const GetWeeklyActivityQueryEmptyMocks = (): MockedResponse[] => {
  const weekInterval = Interval.fromDateTimes(
    DateTime.local().set({ localWeekday: 1 }),
    DateTime.local().set({ localWeekday: 7 }),
  );
  if (!weekInterval.isValid) {
    throw new Error(`Invalid interval: ${weekInterval.invalidReason}`);
  }

  return [
    {
      request: {
        query: GetWeeklyActivityDocument,
        variables: {
          accountListId: 'abc',
          startOfWeek: weekInterval.start.toISO(),
          endOfWeek: weekInterval.end.toISO(),
        },
      },
      result: {
        data: emptyData,
      },
    },
  ];
};

export const GetWeeklyActivityQueryLoadingMocks = (): MockedResponse[] => {
  return [
    {
      ...GetWeeklyActivityQueryDefaultMocks()[0],
      delay: 100931731455,
    },
  ];
};
