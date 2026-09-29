import React from 'react';
import { render } from '@testing-library/react';
import { AccountInfoBox } from './AccountInfoBox';

describe('AccountInfoBox', () => {
  it('renders name when provided', () => {
    const { getByTestId } = render(<AccountInfoBox name="Test Name" />);
    expect(getByTestId('account-info')).toBeInTheDocument();
    expect(getByTestId('name').textContent).toBe('Test Name');
  });

  it('renders empty strings when name is not provided', () => {
    const { getByTestId } = render(<AccountInfoBox />);
    expect(getByTestId('name').textContent).toBe('');
  });
});
