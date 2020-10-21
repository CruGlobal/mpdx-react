import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import userEvent from '@testing-library/user-event';
import TestRouter from '../../../../../__tests__/util/TestRouter';
import matchMediaMock from '../../../../../__tests__/util/matchMediaMock';
import { AppState } from '../../../App/rootReducer';
import { AppProviderContext } from '../../../App/Provider';
import { getNotificationsMocks } from './NotificationMenu/NotificationMenu.mock';
import { getTopBarMock, getTopBarMultipleMock } from './TopBar.mock';
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
        mocks = [getTopBarMultipleMock(), ...getNotificationsMocks()];
        state = { accountListId: null, breadcrumb: null };
    });

    it('has correct defaults', () => {
        const { queryByTestId, queryByText, getByTestId } = render(
            <MockedProvider mocks={mocks} addTypename={false}>
                <TopBar open={false} handleOpenChange={jest.fn()} />
            </MockedProvider>,
        );
        expect(queryByTestId('TopBarBreadcrumb')).not.toBeInTheDocument();
        userEvent.click(getByTestId('profileMenuButton'));
        expect(queryByText('Manage Organizations')).not.toBeInTheDocument();
        expect(queryByText('Admin Console')).not.toBeInTheDocument();
        expect(queryByText('Backend Admin')).not.toBeInTheDocument();
        expect(queryByText('Sidekiq')).not.toBeInTheDocument();
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
                    admin: false,
                    developer: false,
                    keyAccounts: [{ id: '1', email: 'john.smith@gmail.com' }],
                    administrativeOrganizations: {
                        nodes: [],
                    },
                },
            });
        });
    });

    describe('single accountList', () => {
        beforeEach(() => {
            mocks = [getTopBarMock(), ...getNotificationsMocks()];
            state = { accountListId: '1', breadcrumb: 'Dashboard' };
        });

        it('shows single accountList name', async () => {
            const { getByTestId, getByText } = render(
                <MockedProvider mocks={mocks} addTypename={false}>
                    <TopBar open={false} handleOpenChange={jest.fn()} />
                </MockedProvider>,
            );
            await waitFor(() => expect(getByTestId('TopBarSingleAccountList').textContent).toEqual('Staff Account'));
            userEvent.click(getByTestId('profileMenuButton'));
            expect(getByText('Manage Organizations').parentElement.parentElement).toHaveAttribute(
                'href',
                'https://stage.mpdx.org/preferences/organizations',
            );
            expect(getByText('Admin Console').parentElement.parentElement).toHaveAttribute(
                'href',
                'https://stage.mpdx.org/preferences/admin',
            );
            expect(getByText('Backend Admin').parentElement.parentElement).toHaveAttribute(
                'href',
                'https://auth.stage.mpdx.org/auth/user/admin',
            );
            expect(getByText('Sidekiq').parentElement.parentElement).toHaveAttribute(
                'href',
                'https://auth.stage.mpdx.org/auth/user/sidekiq',
            );
        });
    });
});
