import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import TestRouter from '../../../../../__tests__/util/TestRouter';
import matchMediaMock from '../../../../../__tests__/util/matchMediaMock';
import { GetTopBarQuery } from '../../../../../types/GetTopBarQuery';
import { AppState } from '../../../App/rootReducer';
import { AppProviderContext } from '../../../App/Provider';
import { GET_TOP_BAR_QUERY } from './TopBar';
import TopBar from '.';

let state: AppState;
const dispatch = jest.fn();

jest.mock('../../../App', () => ({
    useApp: (): Partial<AppProviderContext> => ({
        state,
        dispatch,
    }),
}));

describe('TopBar', () => {
    let mocks;
    beforeEach(() => {
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

        mocks = [
            {
                request: {
                    query: GET_TOP_BAR_QUERY,
                },
                result: {
                    data,
                },
            },
        ];
        state = { accountListId: null, breadcrumb: null };
    });

    it('has correct defaults', () => {
        const { queryByTestId } = render(
            <MockedProvider mocks={mocks} addTypename={false}>
                <TopBar open={false} handleOpenChange={jest.fn()} />
            </MockedProvider>,
        );
        expect(queryByTestId('TopBarBreadcrumb')).not.toBeInTheDocument();
    });

    describe('client state set', () => {
        beforeEach(() => {
            matchMediaMock({ width: '1024px' });
            state = { accountListId: '1', breadcrumb: 'Dashboard' };
        });

        it('adjusts menu configuration', async () => {
            const { getByTestId, queryByTestId } = render(
                <TestRouter>
                    <MockedProvider mocks={mocks} addTypename={false}>
                        <TopBar open={false} handleOpenChange={jest.fn()} />
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
            expect(dispatch).toHaveBeenCalledWith({
                type: 'updateUser',
                user: {
                    id: 'user-1',
                    firstName: 'John',
                    lastName: 'Smith',
                    keyAccounts: [{ id: '1', email: 'john.smith@gmail.com' }],
                },
            });
        });
    });

    describe('single accountList', () => {
        beforeEach(() => {
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
            mocks = [
                {
                    request: {
                        query: GET_TOP_BAR_QUERY,
                    },
                    result: {
                        data,
                    },
                },
            ];
            state = { accountListId: '1', breadcrumb: 'Dashboard' };
        });

        it('shows single accountList name', async () => {
            const { getByTestId } = render(
                <MockedProvider mocks={mocks} addTypename={false}>
                    <TopBar open={false} handleOpenChange={jest.fn()} />
                </MockedProvider>,
            );
            await waitFor(() => expect(getByTestId('TopBarSingleAccountList').textContent).toEqual('Staff Account'));
        });
    });
});
