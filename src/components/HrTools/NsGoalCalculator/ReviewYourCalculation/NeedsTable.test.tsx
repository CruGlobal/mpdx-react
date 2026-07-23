import React from 'react';
import { render } from '@testing-library/react';
import { NeedsRow, NeedsWorksheetTable } from './NeedsTable';

describe('NeedsWorksheetTable', () => {
  it('renders line numbers, categories, and currency amounts', () => {
    const rows: NeedsRow[] = [
      {
        line: '1',
        category: 'Salary',
        description: 'Taxes will be deducted from this amount',
        amount: 8774,
      },
      { line: '2', category: 'Total', amount: 0, bold: true },
    ];

    const { getByRole } = render(
      <NeedsWorksheetTable
        rows={rows}
        columnLabel="John & Jane"
        ariaLabel="Monthly Needs"
      />,
    );

    expect(getByRole('table')).toHaveTableStructure({
      columnHeaders: ['Line', 'Category', 'John & Jane'],
      rowHeaders: [expect.stringContaining('Salary'), 'Total'],
      cells: [
        ['1', '$8,774.00'],
        ['2', '$0.00'],
      ],
    });
  });
});
