import React from 'react';
import { render } from '@testing-library/react';
import { SupportNeedsRow, SupportNeedsTable } from './SupportNeedsTable';

const rows: SupportNeedsRow[] = [
  {
    title: 'Salary',
    description: 'Monthly salary description',
    amount: 5000,
  },
  {
    title: 'Total Support Goal',
    amount: 8000,
    bold: true,
  },
  {
    title: 'Administrative Charge',
    amount: 200,
    titleBold: false,
  },
];

describe('SupportNeedsTable', () => {
  it('renders a row for each item with its title', () => {
    const { getByText, getAllByRole } = render(
      <SupportNeedsTable rows={rows} />,
    );

    expect(getAllByRole('row')).toHaveLength(3);
    expect(getByText('Salary')).toBeInTheDocument();
    expect(getByText('Total Support Goal')).toBeInTheDocument();
    expect(getByText('Administrative Charge')).toBeInTheDocument();
  });

  it('formats amounts as currency', () => {
    const { getByText } = render(<SupportNeedsTable rows={rows} />);

    expect(getByText('$5,000')).toBeInTheDocument();
    expect(getByText('$8,000')).toBeInTheDocument();
    expect(getByText('$200')).toBeInTheDocument();
  });

  it('renders the description only when provided', () => {
    const { getByText, getAllByRole } = render(
      <SupportNeedsTable rows={rows} />,
    );

    expect(getByText('Monthly salary description')).toBeInTheDocument();
    expect(getAllByRole('row')[1].textContent).toBe('Total Support Goal$8,000');
  });

  it('bolds amounts only for bold rows', () => {
    const { getAllByTestId } = render(<SupportNeedsTable rows={rows} />);

    const amounts = getAllByTestId('amount-typography');
    expect(amounts[0]).toHaveStyle({ fontWeight: 'normal' });
    expect(amounts[1]).toHaveStyle({ fontWeight: 700 });
  });

  it('bolds titles unless titleBold is false', () => {
    const { getByText } = render(<SupportNeedsTable rows={rows} />);

    expect(getByText('Salary')).toHaveStyle({ fontWeight: 700 });
    expect(getByText('Administrative Charge')).toHaveStyle({
      fontWeight: 'normal',
    });
  });
});
