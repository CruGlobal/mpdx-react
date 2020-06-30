import React, { ReactElement } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { Container, Box } from '@material-ui/core';
import { GET_TOPBAR_QUERY } from '../TopBar/TopBar';
import Chrome from '.';

export default {
    title: 'Chrome',
};

export const Default = (): ReactElement => {
    const mocks = [
        {
            request: {
                query: GET_TOPBAR_QUERY,
            },
            result: {
                data: {},
            },
        },
    ];
    return (
        <MockedProvider mocks={mocks} addTypename={false}>
            <Chrome>
                <Container>
                    <Box my={2}>Chrome Children</Box>
                </Container>
            </Chrome>
        </MockedProvider>
    );
};
