import React, { ReactElement } from 'react';
import { Box } from '@material-ui/core';
import { MockedProvider } from '@apollo/client/testing';
import { ActivityTypeEnum } from '../../../../../graphql/types.generated';
import { GetThisWeekQuery } from '../GetThisWeek.generated';
import PartnerCare from '.';

export default {
  title: 'Dashboard/ThisWeek/PartnerCare',
};

export const Default = (): ReactElement => {
  const task = {
    id: 'task',
    subject: 'the quick brown fox jumps over the lazy dog',
    activityType: ActivityTypeEnum.PrayerRequest,
    contacts: { nodes: [{ name: 'Roger Smith' }, { name: 'Sarah Smith' }] },
    startAt: null,
    completedAt: null,
  };
  const personWithBirthday = {
    id: 'person',
    birthdayDay: 1,
    birthdayMonth: 1,
    firstName: 'John',
    lastName: 'Doe',
    parentContact: {
      id: 'contact',
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
  const prayerRequestTasks: GetThisWeekQuery['prayerRequestTasks'] = {
    nodes: [
      { ...task, id: 'task_4' },
      { ...task, id: 'task_5' },
      { ...task, id: 'task_6' },
    ],
    totalCount: 80,
  };
  const reportsPeopleWithBirthdays: GetThisWeekQuery['reportsPeopleWithBirthdays'] = {
    periods: [
      {
        people: [
          { ...personWithBirthday, id: 'person_1' },
          { ...personWithBirthday, id: 'person_2' },
        ],
      },
    ],
  };
  const reportsPeopleWithAnniversaries: GetThisWeekQuery['reportsPeopleWithAnniversaries'] = {
    periods: [
      {
        people: [
          { ...personWithAnniversary, id: 'person_3' },
          { ...personWithAnniversary, id: 'person_4' },
        ],
      },
    ],
  };
  return (
    <Box m={2}>
      <MockedProvider mocks={[]} addTypename={false}>
        <PartnerCare
          accountListId="abc"
          loading={false}
          prayerRequestTasks={prayerRequestTasks}
          reportsPeopleWithBirthdays={reportsPeopleWithBirthdays}
          reportsPeopleWithAnniversaries={reportsPeopleWithAnniversaries}
        />
      </MockedProvider>
    </Box>
  );
};

export const Empty = (): ReactElement => {
  const prayerRequestTasks: GetThisWeekQuery['prayerRequestTasks'] = {
    nodes: [],
    totalCount: 0,
  };
  const reportsPeopleWithBirthdays: GetThisWeekQuery['reportsPeopleWithBirthdays'] = {
    periods: [
      {
        people: [],
      },
    ],
  };
  const reportsPeopleWithAnniversaries: GetThisWeekQuery['reportsPeopleWithAnniversaries'] = {
    periods: [
      {
        people: [],
      },
    ],
  };
  return (
    <Box m={2}>
      <MockedProvider mocks={[]} addTypename={false}>
        <PartnerCare
          accountListId="abc"
          loading={false}
          prayerRequestTasks={prayerRequestTasks}
          reportsPeopleWithBirthdays={reportsPeopleWithBirthdays}
          reportsPeopleWithAnniversaries={reportsPeopleWithAnniversaries}
        />
      </MockedProvider>
    </Box>
  );
};

export const Loading = (): ReactElement => {
  return (
    <Box m={2}>
      <MockedProvider mocks={[]} addTypename={false}>
        <PartnerCare accountListId="abc" loading={true} />
      </MockedProvider>
    </Box>
  );
};
