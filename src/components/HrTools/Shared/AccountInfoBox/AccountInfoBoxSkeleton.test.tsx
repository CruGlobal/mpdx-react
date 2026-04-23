import React from 'react';
import { render } from '@testing-library/react';
import { AccountInfoBoxSkeleton } from './AccountInfoBoxSkeleton';

describe('AccountInfoBoxSkeleton', () => {
  it('renders the account info container', () => {
    const { getByTestId } = render(<AccountInfoBoxSkeleton />);
    expect(getByTestId('account-info')).toBeInTheDocument();
  });

  it('renders the name skeleton', () => {
    const { getByTestId } = render(<AccountInfoBoxSkeleton />);
    expect(getByTestId('name-skeleton')).toBeInTheDocument();
  });

  it('renders the account id skeleton', () => {
    const { getByTestId } = render(<AccountInfoBoxSkeleton />);
    expect(getByTestId('account-id-skeleton')).toBeInTheDocument();
  });
});
