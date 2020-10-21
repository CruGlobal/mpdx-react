import { MockedResponse } from '@apollo/client/testing';
import { GetTopBarQuery } from '../../../../../types/GetTopBarQuery';
import { GET_TOP_BAR_QUERY } from './TopBar';

export const getTopBarMock = (): MockedResponse => {
    const data: GetTopBarQuery = {
        accountLists: {
            nodes: [{ id: '1', name: 'Staff Account' }],
        },
        user: {
            id: 'user-1',
            firstName: 'John',
            lastName: 'Smith',
            admin: true,
            developer: true,
            keyAccounts: [{ id: '1', email: 'john.smith@gmail.com' }],
            administrativeOrganizations: {
                nodes: [{ id: '1' }],
            },
        },
    };
    return {
        request: {
            query: GET_TOP_BAR_QUERY,
        },
        result: {
            data,
        },
    };
};

export const getTopBarMultipleMock = (): MockedResponse => {
    const data: GetTopBarQuery = {
        accountLists: {
            nodes: [
                { id: '1', name: 'Staff Account' },
                { id: '2', name: 'Ministry Account' },
            ],
        },
        user: {
            id: 'user-1',
            firstName: 'John',
            lastName: 'Smith',
            admin: false,
            developer: false,
            keyAccounts: [{ id: '1', email: 'john.smith@gmail.com' }],
            administrativeOrganizations: {
                nodes: [],
            },
        },
    };
    return {
        request: {
            query: GET_TOP_BAR_QUERY,
        },
        result: {
            data,
        },
    };
};
