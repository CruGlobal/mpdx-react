import React from 'react';
import { render } from '@testing-library/react';
import AnimatedCard from '.';

describe(AnimatedCard.name, () => {
    it('has correct defaults', () => {
        const { getByTestId } = render(
            <AnimatedCard data-testid="TestAnimatedCard">
                <div data-testid="TestAnimatedCardContent" />
            </AnimatedCard>,
        );
        expect(getByTestId('TestAnimatedCard')).toBeInTheDocument();
        expect(getByTestId('TestAnimatedCardContent')).toBeInTheDocument();
    });
});
