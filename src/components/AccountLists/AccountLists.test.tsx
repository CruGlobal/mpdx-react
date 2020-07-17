import React from 'react';
import { render } from '@testing-library/react';
import PageHeading from '.';

describe('PageHeading', () => {
    it('should have correct defaults', () => {
        const { getByTestId } = render(
            <PageHeading
                data={{
                    accountLists: {
                        nodes: [
                            { id: 'abc', name: 'My Personal Staff Account' },
                            { id: 'def', name: 'My Ministry Account' },
                            { id: 'ghi', name: "My Friend's Staff Account" },
                        ],
                    },
                }}
            />,
        );
        expect(getByTestId('abc')).toHaveTextContent('My Personal Staff Account');
        expect(getByTestId('def')).toHaveTextContent('My Ministry Account');
        expect(getByTestId('ghi')).toHaveTextContent("My Friend's Staff Account");
    });
});
