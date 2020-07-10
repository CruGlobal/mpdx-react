import moment from 'moment';
import { GetWeeklyActivityQuery } from '../../../../../types/GetWeeklyActivityQuery';
import { GET_WEEKLY_ACTIVITY_QUERY } from './WeeklyActivity';

const data: GetWeeklyActivityQuery = {
    completedCalls: { totalCount: 5 },
    callsThatProducedAppointments: { totalCount: 20 },
    completedMessages: { totalCount: 14 },
    messagesThatProducedAppointments: { totalCount: 2 },
    completedAppointments: { totalCount: 9 },
    completedCorrespondence: { totalCount: 4 },
};

export const GetWeeklyActivityQueryDefaultMock = {
    request: {
        query: GET_WEEKLY_ACTIVITY_QUERY,
        variables: {
            accountListId: 'abc',
            startOfWeek: moment().startOf('week').toISOString(),
            endOfWeek: moment().endOf('week').toISOString(),
        },
    },
    result: {
        data,
    },
};

const emptyData: GetWeeklyActivityQuery = {
    completedCalls: { totalCount: 0 },
    callsThatProducedAppointments: { totalCount: 0 },
    completedMessages: { totalCount: 0 },
    messagesThatProducedAppointments: { totalCount: 0 },
    completedAppointments: { totalCount: 0 },
    completedCorrespondence: { totalCount: 0 },
};

export const GetWeeklyActivityQueryEmptyMock = {
    request: {
        query: GET_WEEKLY_ACTIVITY_QUERY,
        variables: {
            accountListId: 'abc',
            startOfWeek: moment().startOf('week').toISOString(),
            endOfWeek: moment().endOf('week').toISOString(),
        },
    },
    result: {
        data: emptyData,
    },
};

export const GetWeeklyActivityQueryLoadingMock = {
    request: {
        query: GET_WEEKLY_ACTIVITY_QUERY,
        variables: {
            accountListId: 'abc',
            startOfWeek: moment().startOf('week').toISOString(),
            endOfWeek: moment().endOf('week').toISOString(),
        },
    },
    result: {
        data,
    },
    delay: 100931731455,
};
