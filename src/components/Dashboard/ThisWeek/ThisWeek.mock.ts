import { MockedResponse } from '@apollo/client/testing';
import { DateTime } from 'luxon';
import { ActivityTypeEnum } from 'src/graphql/types.generated';
import { GetThisWeekDocument, GetThisWeekQuery } from './GetThisWeek.generated';
import {
  GetWeeklyActivityQueryDefaultMocks,
  GetWeeklyActivityQueryEmptyMocks,
  GetWeeklyActivityQueryLoadingMocks,
} from './WeeklyActivity/WeeklyActivity.mock';

export const GetThisWeekDefaultMocks = (): MockedResponse[] => {
  const endOfDay = DateTime.local().endOf('day');

  const task = {
    id: 'task',
    subject: 'the quick brown fox jumps over the lazy dog',
    activityType: ActivityTypeEnum.PrayerRequest,
    contacts: { nodes: [{ name: 'Smith, Roger', id: '1' }], totalCount: 1 },
    startAt: DateTime.local(2012, 1, 5, 1, 2).toISODate(),
    completedAt: null,
  };
  const contact = {
    id: 'contact',
    name: 'Smith, Sarah',
    lateAt: '2012-10-01',
  };
  const referral = {
    id: 'contact',
    name: 'Smith, Sarah',
  };
  const personWithBirthday = {
    id: 'person',
    birthdayDay: 1,
    birthdayMonth: 1,
    firstName: 'John',
    lastName: 'Doe',
    parentContact: {
      id: 'contact',
      name: 'John and Sarah, Doe',
    },
  };
  const personWithAnniversary = {
    id: 'person',
    anniversaryDay: 5,
    anniversaryMonth: 10,
    parentContact: {
      id: 'contact',
      name: 'John and Sarah, Doe',
    },
  };
  const data: GetThisWeekQuery = {
    accountList: {
      id: 'abc',
      primaryAppeal: {
        id: 'appeal_1',
        name: '2020 End of Year Ask',
        amount: 1000,
        pledgesAmountTotal: 750,
        pledgesAmountProcessed: 500,
        amountCurrency: 'EUR',
      },
    },
    dueTasks: {
      nodes: [
        { ...task, id: 'task_1' },
        { ...task, id: 'task_2' },
        { ...task, id: 'task_3' },
      ],
      totalCount: 50,
    },
    prayerRequestTasks: {
      nodes: [
        { ...task, id: 'task_4' },
        { ...task, id: 'task_5' },
        { ...task, id: 'task_6' },
      ],
      totalCount: 80,
    },
    latePledgeContacts: {
      nodes: [
        { ...contact, id: 'contact_1' },
        { ...contact, id: 'contact_2' },
        { ...contact, id: 'contact_3' },
      ],
      totalCount: 5,
    },
    reportsPeopleWithBirthdays: {
      periods: [
        {
          people: [
            { ...personWithBirthday, id: 'person_1' },
            { ...personWithBirthday, id: 'person_2' },
          ],
        },
        {
          people: [],
        },
        {
          people: [],
        },
        {
          people: [],
        },
      ],
    },
    reportsPeopleWithAnniversaries: {
      periods: [
        {
          people: [
            { ...personWithAnniversary, id: 'person_3' },
            { ...personWithAnniversary, id: 'person_4' },
          ],
        },
        {
          people: [],
        },
        {
          people: [],
        },
        {
          people: [],
        },
      ],
    },
    recentReferrals: {
      nodes: [
        { ...referral, id: 'contact_4' },
        { ...referral, id: 'contact_5' },
        { ...referral, id: 'contact_6' },
      ],
      totalCount: 5,
    },
    onHandReferrals: {
      nodes: [
        { ...referral, id: 'contact_7' },
        { ...referral, id: 'contact_8' },
        { ...referral, id: 'contact_9' },
      ],
      totalCount: 5,
    },
  };
  return [
    {
      request: {
        query: GetThisWeekDocument,
        variables: {
          accountListId: 'abc',
          endOfDay: endOfDay.toISO(),
          today: endOfDay.toISODate(),
          threeWeeksFromNow: endOfDay.plus({ weeks: 3 }).toISODate(),
          twoWeeksAgo: endOfDay.minus({ weeks: 2 }).toISODate(),
        },
      },
      result: {
        data,
      },
    },
    ...GetWeeklyActivityQueryDefaultMocks(),
  ];
};
export const GetThisWeekEmptyMocks = (): MockedResponse[] => {
  const endOfDay = DateTime.local().endOf('day');

  const data: GetThisWeekQuery = {
    accountList: {
      id: 'abc',
      primaryAppeal: null,
    },
    dueTasks: { nodes: [], totalCount: 0 },
    prayerRequestTasks: { nodes: [], totalCount: 0 },
    latePledgeContacts: { nodes: [], totalCount: 0 },
    reportsPeopleWithBirthdays: { periods: [{ people: [] }] },
    reportsPeopleWithAnniversaries: { periods: [{ people: [] }] },
    recentReferrals: { nodes: [], totalCount: 0 },
    onHandReferrals: { nodes: [], totalCount: 0 },
  };
  return [
    {
      request: {
        query: GetThisWeekDocument,
        variables: {
          accountListId: 'abc',
          endOfDay: endOfDay.toISO(),
          today: endOfDay.toISODate(),
          threeWeeksFromNow: endOfDay.plus({ weeks: 3 }).toISODate(),
          twoWeeksAgo: endOfDay.minus({ weeks: 2 }).toISODate(),
        },
      },
      result: {
        data,
      },
    },
    ...GetWeeklyActivityQueryEmptyMocks(),
  ];
};

export const GetThisWeekLoadingMocks = (): MockedResponse[] => {
  return [
    {
      ...GetThisWeekDefaultMocks()[0],
      delay: 100931731455,
    },
    ...GetWeeklyActivityQueryLoadingMocks(),
  ];
};
