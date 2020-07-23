import React from 'react';
import { render } from '@testing-library/react';
import PageHeading from '.';

describe(PageHeading.name, () => {
    it('has correct defaults', () => {
        const { getByTestId } = render(<PageHeading heading="test heading" subheading="test subheading" />);
        expect(getByTestId('PageHeading')).toHaveStyle('margin-bottom: -20px');
        expect(getByTestId('PageHeadingContainer')).toHaveStyle('padding-bottom: 20px');
        expect(getByTestId('PageHeadingHeading')).toHaveTextContent('test heading');
        expect(getByTestId('PageHeadingSubheading')).toHaveTextContent('test subheading');
        expect(getByTestId('PageHeadingImg')).toHaveAttribute('src', 'drawkit-grape-pack-illustration-20.svg');
    });

    it('has correct overrides', () => {
        const { getByTestId, queryByTestId } = render(
            <PageHeading
                heading="test heading"
                imgSrc={require(`../../images/drawkit/grape/drawkit-grape-pack-illustration-1.svg`)}
                overlap={100}
            />,
        );
        expect(getByTestId('PageHeading')).toHaveStyle('margin-bottom: -100px');
        expect(getByTestId('PageHeadingContainer')).toHaveStyle('padding-bottom: 100px');
        expect(queryByTestId('PageHeadingSubheading')).toBeNull();
        expect(getByTestId('PageHeadingImg')).toHaveAttribute('src', 'drawkit-grape-pack-illustration-1.svg');
    });
});
