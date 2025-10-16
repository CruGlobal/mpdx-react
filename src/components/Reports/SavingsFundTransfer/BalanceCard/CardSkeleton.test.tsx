import React from 'react';
import { render } from '@testing-library/react';
import { CardSkeleton } from './CardSkeleton';

describe('CardSkeleton', () => {
  it('renders the skeleton card', () => {
    const { getByTestId } = render(<CardSkeleton />);
    expect(getByTestId('balance-card-skeleton')).toBeInTheDocument();
  });

  it('renders the icon skeleton', () => {
    const { getByTestId } = render(<CardSkeleton />);
    // The first rectangular skeleton is the icon
    expect(getByTestId('icon-skeleton')).toBeInTheDocument();
  });

  it('renders the correct number of text skeletons in the details section', () => {
    const { getAllByTestId } = render(<CardSkeleton />);
    expect(getAllByTestId('text-skeleton')).toHaveLength(4);
  });

  it('renders the circular skeleton in the action area', () => {
    const { getByTestId } = render(<CardSkeleton />);
    expect(getByTestId('circle-skeleton')).toBeInTheDocument();
  });
});
