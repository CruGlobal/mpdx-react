import React from 'react';
import { render } from '@testing-library/react';
import Footer from '.';

describe('Footer', () => {
    it('should contain privacy link', () => {
        const { getByTestId } = render(<Footer />);
        expect(getByTestId('privacy')).toHaveAttribute('href', 'https://get.mpdx.org/privacy-policy/');
    });

    it('should contain whats-new link', () => {
        const { getByTestId } = render(<Footer />);
        expect(getByTestId('whats-new')).toHaveAttribute('href', 'https://get.mpdx.org/release-notes/');
    });

    it('should contain terms-of-use link', () => {
        const { getByTestId } = render(<Footer />);
        expect(getByTestId('terms-of-use')).toHaveAttribute('href', 'https://get.mpdx.org/terms-of-use/');
    });

    it('should have correct text', () => {
        const { getByText } = render(<Footer />);
        expect(getByText(`© ${new Date().getFullYear()}, Cru. All Rights Reserved.`)).toBeTruthy();
    });
});
