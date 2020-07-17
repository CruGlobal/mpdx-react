import React from 'react';
import { render } from '@testing-library/react';
import Welcome from '.';

describe('Welcome', () => {
    it('should have correct defaults', () => {
        const { getByTestId } = render(
            <Welcome title="test title" subtitle="test subtitle">
                <div data-testid="children">children</div>
            </Welcome>,
        );
        expect(getByTestId('welcomeTitle')).toHaveTextContent('test title');
        expect(getByTestId('welcomeSubtitle')).toHaveTextContent('test subtitle');
        expect(getByTestId('welcomeImg')).toHaveAttribute('src', 'drawkit-grape-pack-illustration-2.svg');
        expect(getByTestId('children')).toHaveTextContent('children');
    });

    it('should have correct overrides', () => {
        const { getByTestId } = render(
            <Welcome
                title={<div data-testid="testTitle">test title</div>}
                subtitle={<div data-testid="testSubtitle">test subtitle</div>}
                imgSrc={require(`../../images/drawkit/grape/drawkit-grape-pack-illustration-1.svg`)}
            />,
        );
        expect(() => getByTestId('welcomeTitle')).toThrowError();
        expect(() => getByTestId('welcomeSubtitle')).toThrowError();
        expect(getByTestId('testTitle')).toHaveTextContent('test title');
        expect(getByTestId('testSubtitle')).toHaveTextContent('test subtitle');
        expect(getByTestId('welcomeImg')).toHaveAttribute('src', 'drawkit-grape-pack-illustration-1.svg');
    });
});
