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
    amountBold: true,
  },
  {
    title: 'Administrative Charge',
    amount: 200,
    titleBold: false,
  },
];

describe('SupportNeedsTable', () => {
  it('renders a row header with the title and description and a currency-formatted amount for each row', () => {
    const { getByRole } = render(<SupportNeedsTable rows={rows} />);

    expect(getByRole('table')).toHaveTableStructure({
      rowHeaders: [
        'SalaryMonthly salary description',
        'Total Support Goal',
        'Administrative Charge',
      ],
      cells: ['$5,000', '$8,000', '$200'],
    });
  });

  it('bolds amounts only for amountBold rows', () => {
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

  it('hides the bottom border for hideBorder rows and the last row', () => {
    const { getByText } = render(
      <SupportNeedsTable
        rows={[
          { title: 'First', amount: 1 },
          { title: 'Second', amount: 2, hideBorder: true },
          { title: 'Third', amount: 3 },
        ]}
      />,
    );

    expect(getByText('First').closest('th')).toHaveStyle({
      borderBottomStyle: 'solid',
    });
    expect(getByText('Second').closest('th')).toHaveStyle({
      borderBottomStyle: 'none',
    });
    expect(getByText('Third').closest('th')).toHaveStyle({
      borderBottomStyle: 'none',
    });
  });

  it('renders no rows when rows is empty', () => {
    const { getByRole } = render(<SupportNeedsTable rows={[]} />);

    expect(getByRole('table')).toHaveTableStructure({
      rowHeaders: [],
      cells: [],
    });
  });

  it('formats zero amounts as currency', () => {
    const { getByRole } = render(
      <SupportNeedsTable rows={[{ title: 'Special Needs', amount: 0 }]} />,
    );

    expect(getByRole('table')).toHaveTableStructure({
      rowHeaders: ['Special Needs'],
      cells: ['$0'],
    });
  });
});
