import React from 'react';
import { render } from '@testing-library/react';
import { CardSkeleton } from './CardSkeleton';

describe('CardSkeleton', () => {
  it('renders the skeleton card', () => {
    const { getByTestId } = render(<CardSkeleton />);
    expect(getByTestId('CardSkeleton')).toBeInTheDocument();
  });

  it('renders the icon skeleton', () => {
    const { container } = render(<CardSkeleton />);
    // The first rectangular skeleton is the icon
    const iconSkeleton = container.querySelector(
      '.MuiSkeleton-root.MuiSkeleton-rectangular',
    );
    expect(iconSkeleton).toBeInTheDocument();
    expect(iconSkeleton).toHaveStyle({ width: '40px', height: '40px' });
  });

  it('renders text skeletons for the title and balance sections', () => {
    const { container } = render(<CardSkeleton />);
    const textSkeletons = container.querySelectorAll('.MuiSkeleton-text');
    expect(textSkeletons.length).toBe(4);
  });

  it('renders the correct structure', () => {
    const { container } = render(<CardSkeleton />);
    expect(container.querySelector('.MuiCard-root')).toBeInTheDocument();
    expect(container.querySelectorAll('.MuiBox-root').length).toBeGreaterThan(
      0,
    );
  });
});
