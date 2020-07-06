import React, { ReactElement } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { Container, Box } from '@material-ui/core';
import { InMemoryCache } from '@apollo/client';
import GET_LOCAL_STATE_QUERY from '../../../queries/getLocalStateQuery.graphql';
import { GET_TOP_BAR_QUERY } from './TopBar/TopBar';
import Primary from '.';

export default {
    title: 'Layouts/Primary',
};

export const Default = (): ReactElement => {
    const mocks = [
        {
            request: {
                query: GET_TOP_BAR_QUERY,
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
            </Primary>
        </MockedProvider>
    );
};
