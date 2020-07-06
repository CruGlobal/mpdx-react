import React, { ReactElement } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { Container, Box } from '@material-ui/core';
import { InMemoryCache } from '@apollo/client';
import GET_LOCAL_STATE_QUERY from '../../../queries/getLocalStateQuery.graphql';
import { GET_NAV_QUERY } from './Nav/Nav';
import Primary from '.';

export default {
    title: 'Layouts/Primary',
};

export const Default = (): ReactElement => {
    const mocks = [
        {
            request: {
                query: GET_NAV_QUERY,
            },
            result: {
                data: {
                    accountLists: { nodes: [{ id: '1', name: 'Staff Account' }] },
                    user: { firstName: 'John' },
                },
            },
        },
    ];

    const cache = new InMemoryCache({ addTypename: false });
    cache.writeQuery({
        query: GET_LOCAL_STATE_QUERY,
        data: {
            currentAccountListId: '1',
            breadcrumb: null,
        },
    });

    return (
        <MockedProvider mocks={mocks} cache={cache} addTypename={false}>
            <Primary>
                <Container>
                    <Box my={2}>Primary Layout</Box>
                </Container>
            </Primary>
        </MockedProvider>
    );
};
