import React from 'react';
import { render } from '@testing-library/react';
import TopBar from '.';

describe(TopBar.name, () => {
    it('has correct defaults', () => {
        const { getByTestId } = render(
            <TopBar>
                <div data-testid="PrimaryTestChildren"></div>
            </TopBar>,
        );
        expect(getByTestId('PrimaryTestChildren')).toBeInTheDocument();
    });
});
