import React from 'react';
import { render } from '@testing-library/react';
import { AccountBalanceCard } from './AccountBalanceCard';

describe('AccountBalanceCard', () => {
  it('renders the title, headers, and balance', () => {
    const { getByRole } = render(
      <AccountBalanceCard minAccountBalance={9580} columnLabel="John & Jane" />,
    );

    expect(getByRole('table')).toHaveTableStructure({
      columnHeaders: ['Category', 'John & Jane'],
      rowHeaders: ['Minimum Account Balance Needed to Report'],
      cells: [['$9,580.00']],
    });
  });

  it('renders a zero balance as currency rather than blank', () => {
    const { getByRole } = render(
      <AccountBalanceCard minAccountBalance={0} columnLabel="John" />,
    );

    expect(getByRole('table')).toHaveTableStructure({
      cells: [['$0.00']],
    });
  });
});
