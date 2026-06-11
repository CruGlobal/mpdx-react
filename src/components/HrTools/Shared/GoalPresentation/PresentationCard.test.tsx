import React from 'react';
import { render } from '@testing-library/react';
import { PresentationCard } from './PresentationCard';

describe('PresentationCard', () => {
  it('renders the title and children', () => {
    const { getByRole, getByText } = render(
      <PresentationCard title="Card Title">
        <p>Card content</p>
      </PresentationCard>,
    );

    expect(getByRole('heading', { name: 'Card Title' })).toBeInTheDocument();
    expect(getByText('Card content')).toBeInTheDocument();
  });
});
