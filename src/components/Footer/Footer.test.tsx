import React from 'react';
import MockDate from 'mockdate';
import { render } from '../../../__tests__/util/testingLibraryReactMock';
import Footer from '.';

describe('Footer', () => {
    it('contains privacy link', () => {
        const { getByTestId } = render(<Footer />);
        expect(getByTestId('privacy')).toHaveAttribute('href', 'https://get.mpdx.org/privacy-policy/');
    });

    it('contains whats-new link', () => {
        const { getByTestId } = render(<Footer />);
        expect(getByTestId('whats-new')).toHaveAttribute('href', 'https://get.mpdx.org/release-notes/');
    });

    it('contains terms-of-use link', () => {
        const { getByTestId } = render(<Footer />);
        expect(getByTestId('terms-of-use')).toHaveAttribute('href', 'https://get.mpdx.org/terms-of-use/');
    });

    describe('mocked Date', () => {
        beforeEach(() => {
            MockDate.set('2000-11-22');
        });

        afterEach(() => {
            MockDate.reset();
        });

        it('has correct text', () => {
            const { getByTestId } = render(<Footer />);
            expect(getByTestId('copyright').textContent).toEqual('© 2000, Cru. All Rights Reserved.');
        });
    });
});
