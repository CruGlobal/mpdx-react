import React from 'react';
import { render } from '@testing-library/react';
import InfoBlock from '.';

describe('InfoBlock', () => {
    it('has correct defaults', () => {
        const { getByTestId, getByText } = render(
            <InfoBlock title="Hello World">
                <div data-testid="children"></div>
            </InfoBlock>,
        );
        const element = getByTestId('children');
        expect(element).toBeInTheDocument();
        expect(element.parentElement.tagName).toEqual('P');
        expect(getByText('Hello World')).toBeInTheDocument();
    });

    it('has correct overrides', () => {
        const { getByTestId } = render(
            <InfoBlock title="Hello World" disableChildrenTypography>
                <div data-testid="children"></div>
            </InfoBlock>,
        );
        const element = getByTestId('children');
        expect(element.parentElement.tagName).toEqual('DIV');
    });
});
