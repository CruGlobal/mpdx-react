import React from 'react';
import { render } from '@testing-library/react';
import { AccountInfoBox } from './AccountInfoBox';

describe('AccountInfoBox', () => {
  it('renders name and accountId when provided', () => {
    const { getByTestId } = render(
      <AccountInfoBox name="Test Name" accountId="12345" />,
    );
    expect(getByTestId('account-info')).toBeInTheDocument();
    expect(getByTestId('name')).toBeInTheDocument();
    expect(getByTestId('account-id')).toBeInTheDocument();
  });

  it('renders empty strings when name and accountId are not provided', () => {
    const { getByTestId } = render(<AccountInfoBox />);
    expect(getByTestId('name').textContent).toBe('');
    expect(getByTestId('account-id').textContent).toBe('');
  });

  it('displays only name when accountId is not provided', () => {
    const { getByTestId } = render(<AccountInfoBox name="Only Name" />);
    expect(getByTestId('name').textContent).toBe('Only Name');
    expect(getByTestId('account-id').textContent).toBe('');
  });

  it('renders only accountId when name is not provided', () => {
    const { getByTestId } = render(<AccountInfoBox accountId="OnlyId" />);
    expect(getByTestId('account-id').textContent).toBe('OnlyId');
  });
});
