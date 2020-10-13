import React, { ReactElement } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { Container, Box } from '@material-ui/core';
import withDispatch from '../../../decorators/withDispatch';
import { GetTopBarQuery } from '../../../../types/GetTopBarQuery';
import { GET_TOP_BAR_QUERY } from './TopBar/TopBar';
import { getNotificationsMocks } from './TopBar/NotificationMenu/NotificationMenu.mock';
import Primary from '.';

export default {
    title: 'Layouts/Primary',
    decorators: [
        withDispatch(
            { type: 'updateAccountListId', accountListId: '1' },
            { type: 'updateBreadcrumb', breadcrumb: 'Dashboard' },
        ),
    ],
};

export const Default = (): ReactElement => {
    const data: GetTopBarQuery = {
        accountLists: { nodes: [{ id: '1', name: 'Staff Account' }] },
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
        <MockedProvider mocks={mocks} addTypename={false}>
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
