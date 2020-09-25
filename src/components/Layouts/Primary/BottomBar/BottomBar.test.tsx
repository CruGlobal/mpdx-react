import React from 'react';
import { render } from '@testing-library/react';
import BottomBar from '.';

describe('BottomBar', () => {
    it('has correct defaults', () => {
        const { getByTestId } = render(<BottomBar />);
        expect(getByTestId('BottomBarOverview')).toBeInTheDocument();
    });
});
