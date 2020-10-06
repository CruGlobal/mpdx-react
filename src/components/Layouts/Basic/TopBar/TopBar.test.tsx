import React from 'react';
import { render } from '@testing-library/react';
import TestRouter from '../../../../../__tests__/util/TestRouter';
import TopBar from '.';

describe('TopBar', () => {
    it('has correct defaults', () => {
        const { getByTestId } = render(
            <TestRouter>
                <TopBar>
                    <div data-testid="PrimaryTestChildren"></div>
                </TopBar>
            </TestRouter>,
        );
        expect(getByTestId('PrimaryTestChildren')).toBeInTheDocument();
    });
});
