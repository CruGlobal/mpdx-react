import React from 'react';
import { render } from '@testing-library/react';
import { BalanceCardSkeleton } from './BalanceCardSkeleton';

describe('BalanceCardSkeleton', () => {
  it('renders the skeleton card', () => {
    const { getByTestId } = render(<BalanceCardSkeleton />);
    expect(getByTestId('balance-card-skeleton')).toBeInTheDocument();
  });

  it('renders the icon skeleton', () => {
    const { container } = render(<BalanceCardSkeleton />);
    // The first rectangular skeleton is the icon
    const iconSkeleton = container.querySelector(
      'span.MuiSkeleton-rectangular',
    );
    expect(iconSkeleton).toBeInTheDocument();
  });

  it('renders the correct number of text skeletons in the details section', () => {
    const { container } = render(<BalanceCardSkeleton />);
    const textSkeletons = container.querySelectorAll('span.MuiSkeleton-text');
    expect(textSkeletons.length).toBeGreaterThanOrEqual(6);
  });

  it('renders the circular skeleton in the action area', () => {
    const { container } = render(<BalanceCardSkeleton />);
    const circularSkeleton = container.querySelector(
      'span.MuiSkeleton-circular',
    );
    expect(circularSkeleton).toBeInTheDocument();
  });
});
