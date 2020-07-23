import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import { InMemoryCache } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing';
import GET_LOCAL_STATE_QUERY from '../../../../queries/getLocalStateQuery.graphql';
import TestRouter from '../../../../../tests/TestRouter';
import matchMediaMock from '../../../../../tests/matchMediaMock';
import { GET_TOP_BAR_QUERY } from './TopBar';
import TopBar from '.';

describe(TopBar.name, () => {
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
                currentAccountListId: undefined,
                breadcrumb: undefined,
            },
        });
    });

    it('has correct defaults', () => {
        const { queryByTestId } = render(
            <MockedProvider mocks={mocks} cache={cache} addTypename={false}>
                <TopBar handleDrawerToggle={jest.fn()} />
            </MockedProvider>,
        );
        expect(queryByTestId('TopBarBreadcrumb')).not.toBeInTheDocument();
    });

    describe('client state set', () => {
        beforeEach(() => {
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

        it('adjusts menu configuration', async () => {
            const { getByTestId, queryByTestId } = render(
                <TestRouter>
                    <MockedProvider mocks={mocks} cache={cache} addTypename={false}>
                        <TopBar handleDrawerToggle={jest.fn()} />
                    </MockedProvider>
                </TestRouter>,
            );
            expect(getByTestId('TopBarBreadcrumb').textContent).toEqual('Dashboard');
            await waitFor(() => expect(getByTestId('TopBarButton')).toBeInTheDocument());
            fireEvent.click(getByTestId('TopBarButton'));
            await waitFor(() => expect(getByTestId('TopBarMenu')).toBeInTheDocument());
            const TopBarMenuItem1 = getByTestId('TopBarMenuItem1');
            expect(TopBarMenuItem1.textContent).toEqual('Staff Account');
            expect(TopBarMenuItem1).toHaveClass('Mui-selected');
            fireEvent.click(TopBarMenuItem1);
            await waitFor(() => expect(queryByTestId('TopBarMenu')).not.toBeInTheDocument());
        });
    });

    describe('single accountList', () => {
        beforeEach(() => {
            mocks = [
                {
                    request: {
                        query: GET_TOP_BAR_QUERY,
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
            cache = new InMemoryCache({ addTypename: false });
            cache.writeQuery({
                query: GET_LOCAL_STATE_QUERY,
                data: {
                    currentAccountListId: '1',
                    breadcrumb: 'Dashboard',
                },
            });
        });

        it('shows single accountList name', async () => {
            const { getByTestId } = render(
                <MockedProvider mocks={mocks} cache={cache} addTypename={false}>
                    <TopBar handleDrawerToggle={jest.fn()} />
                </MockedProvider>,
            );
            await waitFor(() => expect(getByTestId('TopBarSingleAccountList').textContent).toEqual('Staff Account'));
        });
    });
});
