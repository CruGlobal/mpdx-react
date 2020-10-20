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
            keyAccounts: [{ id: '1', email: 'john.smith@gmail.com' }],
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
            keyAccounts: [{ id: '1', email: 'john.smith@gmail.com' }],
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
