import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import matchMediaMock from '../../../../../tests/matchMediaMock';
import { AppProvider } from '../../../App';
import TestRouter from '../../../../../tests/TestRouter';
import Sidebar from '.';

describe(Sidebar.name, () => {
    beforeEach(() => {
        matchMediaMock({ width: '1024px' });
    });

    it('has correct defaults', () => {
        const { getByTestId, queryByTestId } = render(
            <AppProvider initialState={{ accountListId: 'account-1' }}>
                <Sidebar mobileOpen={false} handleDrawerToggle={jest.fn()} />
            </AppProvider>,
        );
        expect(queryByTestId('SideBarMobileDrawer')).not.toBeInTheDocument();
        expect(getByTestId('SideBarDesktopDrawer')).toBeInTheDocument();
        const sideBarOverview = getByTestId('SideBarOverview');
        expect(sideBarOverview).toBeVisible();
        expect(sideBarOverview).toHaveAttribute('href', '/accountLists/account-1');
        const sideBarTasks = getByTestId('SideBarTasks');
        expect(sideBarTasks).toBeVisible();
        expect(sideBarTasks).toHaveAttribute('href', '/accountLists/account-1/tasks/list');
    });

    describe('mobile', () => {
        beforeEach(() => {
            matchMediaMock({ width: '640px' });
        });

        it('allows menu to be shown and hidden', () => {
            const handleDrawerToggle = jest.fn();
            const { getByTestId, queryByTestId, getByText, rerender } = render(
                <TestRouter>
                    <AppProvider initialState={{ accountListId: 'account-1' }}>
                        <Sidebar mobileOpen={false} handleDrawerToggle={handleDrawerToggle} />,
                    </AppProvider>
                </TestRouter>,
            );
            expect(queryByTestId('SideBarDesktopDrawer')).not.toBeInTheDocument();
            expect(getByText('Overview')).not.toBeVisible();
            const sideBarMobileDrawer = getByTestId('SideBarMobileDrawer');
            expect(sideBarMobileDrawer).toBeInTheDocument();
            fireEvent.click(sideBarMobileDrawer.children[0]);
            expect(handleDrawerToggle).toHaveBeenCalled();
            rerender(
                <TestRouter>
                    <AppProvider initialState={{ accountListId: 'account-1' }}>
                        <Sidebar mobileOpen={true} handleDrawerToggle={handleDrawerToggle} />
                    </AppProvider>
                </TestRouter>,
            );
            expect(getByText('Overview')).toBeVisible();
        });
    });
});
