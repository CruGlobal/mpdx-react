import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { InMemoryCache } from '@apollo/client';
import matchMediaMock from '../../../../tests/matchMediaMock';
import GET_LOCAL_STATE_QUERY from '../../../queries/getLocalStateQuery.graphql';
import { DrawerProviderContext } from '../../Drawer/Provider';
import { GET_TOP_BAR_QUERY } from './TopBar/TopBar';
import Primary from '.';

jest.mock('../../Drawer', () => ({
    useDrawer: (): Partial<DrawerProviderContext> => ({
        openTaskDrawer: jest.fn(),
    }),
}));

describe(Primary.name, () => {
    let mocks, cache;
    beforeEach(() => {
        mocks = [
            {
                request: {
                    query: GET_TOP_BAR_QUERY,
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
        cache = new InMemoryCache({ addTypename: false });
        cache.writeQuery({
            query: GET_LOCAL_STATE_QUERY,
            data: {
                currentAccountListId: '1',
                breadcrumb: 'Dashboard',
            },
        });
        matchMediaMock({ width: '1024px' });
    });

    it('has correct defaults', () => {
        const { getByTestId, queryByTestId } = render(
            <MockedProvider mocks={mocks} cache={cache} addTypename={false}>
                <Primary>
                    <div data-testid="PrimaryTestChildren"></div>
                </Primary>
            </MockedProvider>,
        );
        expect(getByTestId('PrimaryTestChildren')).toBeInTheDocument();
        expect(queryByTestId('SideBarMobileDrawer')).not.toBeInTheDocument();
        expect(getByTestId('SideBarDesktopDrawer')).toBeInTheDocument();
        expect(getByTestId('SideBarOverview')).toBeVisible();
    });

    describe('mobile', () => {
        beforeEach(() => {
            matchMediaMock({ width: '640px' });
        });

        it('allows menu to be shown and hidden', async () => {
            const { getByTestId, queryByTestId } = render(
                <MockedProvider mocks={mocks} cache={cache} addTypename={false}>
                    <Primary>
                        <div data-testid="PrimaryTestChildren"></div>
                    </Primary>
                </MockedProvider>,
            );
            expect(queryByTestId('SideBarDesktopDrawer')).not.toBeInTheDocument();
            const sideBarOverview = getByTestId('SideBarOverview');
            expect(sideBarOverview).not.toBeVisible();
            const sideBarMobileDrawer = getByTestId('SideBarMobileDrawer');
            expect(sideBarMobileDrawer).toBeInTheDocument();
            fireEvent.click(sideBarMobileDrawer.children[0]);
            expect(sideBarOverview).toBeVisible();
            fireEvent.click(sideBarOverview);
            await waitFor(() => expect(sideBarOverview).not.toBeVisible());
        });
    });
});
