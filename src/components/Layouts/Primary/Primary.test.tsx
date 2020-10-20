import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import matchMediaMock from '../../../../__tests__/util/matchMediaMock';
import TestWrapper from '../../../../__tests__/util/TestWrapper';
import { getNotificationsMocks } from './TopBar/NotificationMenu/NotificationMenu.mock';
import { getSideBarMock } from './SideBar/SideBar.mock';
import { getTopBarMock } from './TopBar/TopBar.mock';
import Primary from '.';

describe('Primary', () => {
    let mocks;
    beforeEach(() => {
        mocks = [...getNotificationsMocks(), getTopBarMock(), getSideBarMock()];
        matchMediaMock({ width: '1024px' });
    });

    it('has correct defaults', () => {
        const { getByTestId, queryByTestId, getByRole } = render(
            <TestWrapper mocks={mocks} initialState={{ accountListId: '1', breadcrumb: 'Dashboard' }}>
                <Primary>
                    <div data-testid="PrimaryTestChildren"></div>
                </Primary>
            </TestWrapper>,
        );
        expect(getByTestId('PrimaryTestChildren')).toBeInTheDocument();
        expect(queryByTestId('SideBarMobileDrawer')).not.toBeInTheDocument();
        expect(getByTestId('SideBarDesktopDrawer')).toBeInTheDocument();
        expect(getByRole('link', { name: 'Dashboard' })).toBeVisible();
    });

    describe('mobile', () => {
        beforeEach(() => {
            matchMediaMock({ width: '640px' });
        });

        it('allows menu to be shown and hidden', async () => {
            const { getByTestId, queryByTestId, getByRole, queryByRole } = render(
                <TestWrapper mocks={mocks} initialState={{ accountListId: '1', breadcrumb: 'Dashboard' }}>
                    <Primary>
                        <div data-testid="PrimaryTestChildren"></div>
                    </Primary>
                </TestWrapper>,
            );
            expect(queryByTestId('SideBarDesktopDrawer')).not.toBeInTheDocument();
            expect(queryByRole('link', { name: 'Dashboard' })).not.toBeInTheDocument();
            const sideBarMobileDrawer = getByTestId('SideBarMobileDrawer');
            expect(sideBarMobileDrawer).toBeInTheDocument();
            fireEvent.click(getByRole('button', { name: 'Show Menu' }));
            fireEvent.click(getByRole('link', { name: 'Dashboard' }));
            await waitFor(() => expect(queryByRole('link', { name: 'Dashboard' })).not.toBeInTheDocument());
        });
    });
});
