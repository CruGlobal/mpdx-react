import React from 'react';
import { render } from '@testing-library/react';
import { NameDisplaySkeleton } from './NameDisplaySkeleton';

describe('NameDisplaySkeleton', () => {
  it('renders the amounts row with showContent', () => {
    const { getByTestId } = render(<NameDisplaySkeleton showContent />);
    expect(getByTestId('name-display-skeleton-amounts')).toBeInTheDocument();
  });

  it('renders only the header without showContent', () => {
    const { getByTestId, queryByTestId } = render(<NameDisplaySkeleton />);
    expect(getByTestId('name-display-skeleton')).toBeInTheDocument();
    expect(
      queryByTestId('name-display-skeleton-amounts'),
    ).not.toBeInTheDocument();
  });
});
