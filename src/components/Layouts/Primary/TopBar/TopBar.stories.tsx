import React, { ReactElement } from 'react';
import { Box, Container } from '@material-ui/core';
import { MockedProvider } from '@apollo/client/testing';
import withDispatch from '../../../../decorators/withDispatch';
import { GetTopBarQuery } from '../../../../../types/GetTopBarQuery';
import { GET_TOP_BAR_QUERY } from './TopBar';
import { getNotificationsMocks } from './NotificationMenu/NotificationMenu.mock';
import TopBar from '.';

export default {
    title: 'Layouts/Primary/TopBar',
    decorators: [
        withDispatch(
            { type: 'updateAccountListId', accountListId: '1' },
            { type: 'updateBreadcrumb', breadcrumb: 'Dashboard' },
        ),
    ],
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
    const mocks = [
        {
            request: {
                query: GET_TOP_BAR_QUERY,
            },
            result: {
                data,
            },
        },
        ...getNotificationsMocks(),
    ];

    return (
        <>
            <MockedProvider mocks={mocks} addTypename={false}>
                <TopBar open={false} handleOpenChange={(): void => {}} />
            </MockedProvider>
            <Content />
        </>
    );
};

export const MultipleAccountLists = (): ReactElement => {
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
    const mocks = [
        {
            request: {
                query: GET_TOP_BAR_QUERY,
            },
            result: {
                data,
            },
        },
        ...getNotificationsMocks(),
    ];

    return (
        <>
            <MockedProvider mocks={mocks} addTypename={false}>
                <TopBar open={false} handleOpenChange={(): void => {}} />
            </MockedProvider>
            <Content />
        </>
    );
};
