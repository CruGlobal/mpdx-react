import React from 'react';
import { render } from '@testing-library/react';
import { SpecialNeedsCard } from './SpecialNeedsCard';

describe('SpecialNeedsCard', () => {
  it('renders every line of the worksheet in order', () => {
    const { getByRole } = render(
      <SpecialNeedsCard columnLabel="John & Jane" />,
    );

    expect(
      getByRole('heading', { name: 'Special Needs During MPD' }),
    ).toBeInTheDocument();

    expect(getByRole('table')).toHaveTableStructure({
      columnHeaders: ['', 'Category', 'John & Jane'],
      rowHeaders: [
        expect.stringContaining('IBS / NSO'),
        expect.stringContaining('Faith & Finances Course'),
        expect.stringContaining('Refresh Retreat'),
        expect.stringContaining('Cru National Conference'),
        expect.stringContaining('Subtotal'),
        expect.stringContaining('Subtotal with Admin Assessment'),
        expect.stringContaining('Special Needs Developed to Date'),
        expect.stringContaining('Special Needs to be Developed'),
      ],
      cells: [
        ['1', '$0.00'],
        ['2', '$0.00'],
        ['3', '$0.00'],
        ['4', '$0.00'],
        ['5', '$0.00'],
        ['6', '$0.00'],
        ['7', '$0.00'],
        ['8', '$0.00'],
      ],
    });
  });
});
