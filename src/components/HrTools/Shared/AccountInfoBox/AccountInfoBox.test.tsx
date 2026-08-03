import React from 'react';
import { render } from '@testing-library/react';
import { AccountInfoBox } from './AccountInfoBox';

describe('AccountInfoBox', () => {
  it('renders name and overallBalance when provided', () => {
    const { getByTestId } = render(
      <AccountInfoBox name="Test Name" overallBalance={1000} />,
    );
    expect(getByTestId('account-info')).toBeInTheDocument();
    expect(getByTestId('name')).toBeInTheDocument();
    expect(getByTestId('overall-balance')).toBeInTheDocument();
  });

  it('renders empty strings when name and overallBalance are not provided', () => {
    const { getByTestId, queryByTestId } = render(<AccountInfoBox />);
    expect(getByTestId('name').textContent).toBe('');
    expect(queryByTestId('overall-balance')).not.toBeInTheDocument();
  });

  it('displays only name when overallBalance is not provided', () => {
    const { getByTestId } = render(<AccountInfoBox name="Only Name" />);
    expect(getByTestId('name').textContent).toBe('Only Name');
  });

  it('renders only overallBalance when name is not provided', () => {
    const { getByTestId } = render(<AccountInfoBox overallBalance={1000} />);
    expect(getByTestId('overall-balance').textContent).toBe('$1,000.00');
    expect(getByTestId('name').textContent).toBe('');
  });

  it('renders zero overallBalance correctly', () => {
    const { getByTestId } = render(<AccountInfoBox overallBalance={0} />);
    expect(getByTestId('overall-balance').textContent).toBe('$0.00');
  });
});
