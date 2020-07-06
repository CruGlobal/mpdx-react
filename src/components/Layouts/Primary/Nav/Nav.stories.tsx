import React, { ReactElement } from 'react';
import { Box, Container } from '@material-ui/core';
import { MockedProvider } from '@apollo/client/testing';
import { InMemoryCache } from '@apollo/client';
import GET_LOCAL_STATE_QUERY from '../../../../queries/getLocalStateQuery.graphql';
import { GET_NAV_QUERY } from './Nav';
import Nav from '.';

export default {
    title: 'Layouts/Primary/Nav',
};

const Content = (): ReactElement => (
    <>
        <Box style={{ backgroundColor: '#05699b' }} py={10}></Box>
        <Container>
            <Box my={2}>
                {[...new Array(50)]
                    .map(
                        () => `Cras mattis consectetur purus sit amet fermentum.
Cras justo odio, dapibus ac facilisis in, egestas eget quam.
Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
Praesent commodo cursus magna, vel scelerisque nisl consectetur et.`,
                    )
                    .join('\n')}
            </Box>
        </Container>
    </>
);

export const Default = (): ReactElement => {
    const mocks = [
        {
            request: {
                query: GET_NAV_QUERY,
            },
            result: {
                data: {
                    accountLists: {
                        nodes: [{ id: '1', name: 'Staff Account' }],
                    },
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
            breadcrumb: 'Dashboard',
        },
    });

    return (
        <>
            <MockedProvider mocks={mocks} cache={cache} addTypename={false}>
                <Nav />
            </MockedProvider>
            <Content />
        </>
    );
};

export const MultipleAccountLists = (): ReactElement => {
    const mocks = [
        {
            request: {
                query: GET_NAV_QUERY,
            },
            result: {
                data: {
                    accountLists: {
                        nodes: [
                            { id: '1', name: 'Staff Account' },
                            { id: '2', name: 'Ministry Account' },
                        ],
                    },
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
            breadcrumb: 'Dashboard',
        },
    });

    return (
        <>
            <MockedProvider mocks={mocks} cache={cache} addTypename={false}>
                <Nav />
            </MockedProvider>
            <Content />
        </>
    );
};
