import React from 'react';
import { render } from '@testing-library/react';
import { BalanceCardSkeleton } from './BalanceCardSkeleton';

describe('BalanceCardSkeleton', () => {
  it('renders the skeleton card', () => {
    const { getByTestId } = render(<BalanceCardSkeleton />);
    expect(getByTestId('balance-card-skeleton')).toBeInTheDocument();
  });

  it('renders the icon skeleton', () => {
    const { getByTestId } = render(<BalanceCardSkeleton />);
    // The first rectangular skeleton is the icon
    expect(getByTestId('icon-skeleton')).toBeInTheDocument();
  });

  it('renders the correct number of text skeletons in the details section', () => {
    const { getAllByTestId } = render(<BalanceCardSkeleton />);
    expect(getAllByTestId('text-skeleton')).toHaveLength(6);
  });

  it('renders the circular skeleton in the action area', () => {
    const { getByTestId } = render(<BalanceCardSkeleton />);
    expect(getByTestId('circle-skeleton')).toBeInTheDocument();
  });
});
