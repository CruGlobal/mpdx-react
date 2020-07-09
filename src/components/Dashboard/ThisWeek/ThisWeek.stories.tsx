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
        accountList: { primaryAppeal: null },
        dueTasks: { nodes: [], totalCount: 0 },
        prayerRequestTasks: { nodes: [], totalCount: 0 },
        latePledgeContacts: { nodes: [], totalCount: 0 },
        reportsPeopleWithBirthdays: { periods: [{ people: [] }] },
        reportsPeopleWithAnniversaries: { periods: [{ people: [] }] },
        recentReferrals: { nodes: [], totalCount: 0 },
        onHandReferrals: { nodes: [], totalCount: 0 },
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
