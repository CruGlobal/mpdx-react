import React, { ReactElement } from 'react';
import { Box } from '@material-ui/core';
import { MockedProvider } from '@apollo/client/testing';
import moment from 'moment';
import { GetThisWeekQuery } from '../../../../types/GetThisWeekQuery';
import { ActivityTypeEnum } from '../../../../types/globalTypes';
import { GET_THIS_WEEK_QUERY } from './ThisWeek';
import ThisWeek from '.';

export default {
    title: 'Dashboard/ThisWeek',
};

export const Default = (): ReactElement => {
    const task = {
        id: 'task',
        subject: 'the quick brown fox jumps over the lazy dog',
        activityType: ActivityTypeEnum.PRAYER_REQUEST,
        contacts: { nodes: [{ name: 'Smith, Roger' }] },
    };
    const contact = {
        id: 'contact',
        name: 'Smith, Sarah',
        lateAt: '2012-10-01',
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
    const data: GetThisWeekQuery = {
        dueTasks: { nodes: [task, task, task], totalCount: 50 },
        prayerRequestTasks: { nodes: [task, task, task], totalCount: 80 },
        latePledgeContacts: { nodes: [contact, contact, contact], totalCount: 5 },
        reportsPeopleWithBirthdays: { periods: [{ people: [personWithBirthday, personWithBirthday] }] },
        reportsPeopleWithAnniversaries: { periods: [{ people: [personWithAnniversary, personWithAnniversary] }] },
    };
    const mocks = [
        {
            request: {
                query: GET_THIS_WEEK_QUERY,
                variables: {
                    accountListId: 'abc',
                    endOfDay: moment().endOf('day').toISOString(),
                    today: moment().endOf('day').toISOString().slice(0, 10),
                    twoWeeksFromNow: moment().endOf('day').add(2, 'weeks').toISOString().slice(0, 10),
                },
            },
            result: {
                data,
            },
        },
    ];
    return (
        <MockedProvider mocks={mocks} addTypename={false}>
            <Box m={2}>
                <ThisWeek accountListId="abc" />
            </Box>
        </MockedProvider>
    );
};
export const Empty = (): ReactElement => {
    const data: GetThisWeekQuery = {
        dueTasks: { nodes: [], totalCount: 0 },
        prayerRequestTasks: { nodes: [], totalCount: 0 },
        latePledgeContacts: { nodes: [], totalCount: 0 },
        reportsPeopleWithBirthdays: { periods: [{ people: [] }] },
        reportsPeopleWithAnniversaries: { periods: [{ people: [] }] },
    };
    const mocks = [
        {
            request: {
                query: GET_THIS_WEEK_QUERY,
                variables: {
                    accountListId: 'abc',
                    endOfDay: moment().endOf('day').toISOString(),
                    today: moment().endOf('day').toISOString().slice(0, 10),
                    twoWeeksFromNow: moment().endOf('day').add(2, 'weeks').toISOString().slice(0, 10),
                },
            },
            result: {
                data,
            },
        },
    ];
    return (
        <MockedProvider mocks={mocks} addTypename={false}>
            <Box m={2}>
                <ThisWeek accountListId="abc" />
            </Box>
        </MockedProvider>
    );
};
export const Loading = (): ReactElement => {
    return (
        <MockedProvider mocks={[]} addTypename={false}>
            <Box m={2}>
                <ThisWeek accountListId="abc" />
            </Box>
        </MockedProvider>
    );
};
