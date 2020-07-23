import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import matchMediaMock from '../../../../../tests/matchMediaMock';
import Sidebar from '.';

describe(Sidebar.name, () => {
    beforeEach(() => {
        matchMediaMock({ width: '1024px' });
    });

    it('has correct defaults', () => {
        const { getByTestId, queryByTestId } = render(<Sidebar mobileOpen={false} handleDrawerToggle={jest.fn()} />);
        expect(queryByTestId('SideBarMobileDrawer')).not.toBeInTheDocument();
        expect(getByTestId('SideBarDesktopDrawer')).toBeInTheDocument();
        expect(getByTestId('SideBarOverview')).toBeVisible();
    });

    describe('mobile', () => {
        beforeEach(() => {
            matchMediaMock({ width: '640px' });
        });

        it('allows menu to be shown and hidden', () => {
            const handleDrawerToggle = jest.fn();
            const { getByTestId, queryByTestId, rerender } = render(
                <Sidebar mobileOpen={false} handleDrawerToggle={handleDrawerToggle} />,
            );
            expect(queryByTestId('SideBarDesktopDrawer')).not.toBeInTheDocument();
            const sideBarOverview = getByTestId('SideBarOverview');
            expect(sideBarOverview).not.toBeVisible();
            const sideBarMobileDrawer = getByTestId('SideBarMobileDrawer');
            expect(sideBarMobileDrawer).toBeInTheDocument();
            fireEvent.click(sideBarMobileDrawer.children[0]);
            expect(handleDrawerToggle).toHaveBeenCalled();
            rerender(<Sidebar mobileOpen={true} handleDrawerToggle={handleDrawerToggle} />);
            expect(sideBarOverview).toBeVisible();
        });
    });
});
