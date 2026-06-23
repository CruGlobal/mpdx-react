import React from 'react';
import { render } from '@testing-library/react';
import { AccountInfoBox } from './AccountInfoBox';

describe('AccountInfoBox', () => {
  it('renders name, accountId, and overallBalance when provided', () => {
    const { getByTestId } = render(
      <AccountInfoBox
        name="Test Name"
        accountId="12345"
        overallBalance={1000}
      />,
    );
    expect(getByTestId('account-info')).toBeInTheDocument();
    expect(getByTestId('name')).toBeInTheDocument();
    expect(getByTestId('account-id')).toBeInTheDocument();
    expect(getByTestId('InfoOutlinedIcon')).toBeInTheDocument();
    expect(getByTestId('overall-balance')).toBeInTheDocument();
  });

  it('renders empty strings when name, accountId, and overallBalance are not provided', () => {
    const { getByTestId, queryByTestId } = render(<AccountInfoBox />);
    expect(getByTestId('name').textContent).toBe('');
    expect(queryByTestId('account-id')).not.toBeInTheDocument();
    expect(queryByTestId('InfoOutlinedIcon')).not.toBeInTheDocument();
    expect(queryByTestId('overall-balance')).not.toBeInTheDocument();
  });

  it('displays only name when accountId and overallBalance are not provided', () => {
    const { getByTestId, queryByTestId } = render(
      <AccountInfoBox name="Only Name" />,
    );
    expect(getByTestId('name').textContent).toBe('Only Name');
    expect(queryByTestId('account-id')).not.toBeInTheDocument();
    expect(queryByTestId('InfoOutlinedIcon')).not.toBeInTheDocument();
  });

  it('renders only accountId when name and overallBalance are not provided', () => {
    const { getByTestId } = render(<AccountInfoBox accountId="OnlyId" />);
    expect(getByTestId('account-id').textContent).toBe('OnlyId');
    expect(getByTestId('InfoOutlinedIcon')).toBeInTheDocument();
    expect(getByTestId('name').textContent).toBe('');
  });

  it('renders only overallBalance when name and accountId are not provided', () => {
    const { getByTestId, queryByTestId } = render(
      <AccountInfoBox overallBalance={1000} />,
    );
    expect(getByTestId('overall-balance').textContent).toBe('$1,000.00');
    expect(getByTestId('name').textContent).toBe('');
    expect(queryByTestId('account-id')).not.toBeInTheDocument();
    expect(queryByTestId('InfoOutlinedIcon')).not.toBeInTheDocument();
  });
});
