import React, { ReactElement } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { GET_ACCOUNT_LISTS_QUERY } from './Home';
import Home from '.';

export default {
    title: 'Home',
};

export const Default = (): ReactElement => {
    const mocks = [
        {
            request: {
                query: GET_ACCOUNT_LISTS_QUERY,
            },
            result: {
                data: {},
            },
        },
    ];
    return (
        <MockedProvider mocks={mocks} addTypename={false}>
            <Home />
        </MockedProvider>
    );
};

export const WithAccountLists = (): ReactElement => {
    const mocks = [
        {
            request: {
                query: GET_ACCOUNT_LISTS_QUERY,
            },
            result: {
                data: {
                    accountLists: {
                        nodes: [
                            { id: 'abc', name: 'My Personal Staff Account' },
                            { id: 'def', name: 'My Ministry Account' },
                            { id: 'ghi', name: "My Friend's Staff Account" },
                        ],
                    },
                },
            },
        },
    ];
    return (
        <MockedProvider mocks={mocks} addTypename={false}>
            <Home />
        </MockedProvider>
    );
};
