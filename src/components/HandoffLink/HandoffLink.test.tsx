import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestWrapper from '../../../tests/TestWrapper';
import HandoffLink from '.';

describe('HandoffLink', () => {
    let open: jest.Mock;
    let originalOpen: Window['open'];

    beforeEach(() => {
        open = jest.fn();
        originalOpen = window.open;
        window.open = open;
    });

    afterEach(() => {
        window.open = originalOpen;
    });

    it('default', async () => {
        const { getByRole } = render(
            <TestWrapper
                initialState={{
                    accountListId: 'accountListId',
                    user: { id: 'userId', firstName: 'Bob', lastName: 'Jones' },
                }}
            >
                <HandoffLink path="/contacts">
                    <a>Link</a>
                </HandoffLink>
            </TestWrapper>,
        );
        const linkElement = getByRole('link', { name: 'Link' });
        expect(linkElement).toHaveAttribute('href', 'https://stage.mpdx.org/contacts');
        userEvent.click(linkElement);
        expect(open).toHaveBeenCalledWith(
            'http://localhost/api/handoff?accountListId=accountListId&userId=userId&path=%2Fcontacts',
            '_blank',
        );
    });

    it('onClick defaultPrevented', async () => {
        const handleClick = jest.fn((e) => e.preventDefault());
        const { getByRole } = render(
            <HandoffLink path="/contacts">
                <a onClick={handleClick}>Link</a>
            </HandoffLink>,
        );
        const linkElement = getByRole('link', { name: 'Link' });
        expect(linkElement).toHaveAttribute('href', 'https://stage.mpdx.org/contacts');
        userEvent.click(linkElement);
        expect(handleClick).toHaveBeenCalled();
        expect(open).not.toHaveBeenCalled();
    });

    it('enforces single child', async () => {
        expect(() =>
            render(
                <HandoffLink path="/contacts">
                    <a>Link</a>
                    <a>Link</a>
                </HandoffLink>,
            ),
        ).toThrowError();
    });
});
