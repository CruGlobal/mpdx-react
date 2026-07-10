import React from 'react';
import { render } from '@testing-library/react';
import { SpecialNeedsCard } from './SpecialNeedsCard';

describe('SpecialNeedsCard', () => {
  // TODO(MPDX-9801): once special-needs figures are computed server-side, these
  // amounts should render as real currency instead of the "—" placeholder.
  it('renders every line as not-yet-available until special needs data lands', () => {
    const { getByRole } = render(
      <SpecialNeedsCard columnLabel="John & Jane" adminRate={0.12} />,
    );

    expect(
      getByRole('heading', { name: 'Special Needs During MPD' }),
    ).toBeInTheDocument();

    expect(getByRole('table')).toHaveTableStructure({
      columnHeaders: ['Line', 'Category', 'John & Jane'],
      rowHeaders: [
        expect.stringContaining('IBS / NSO'),
        expect.stringContaining('Faith & Finances Course'),
        expect.stringContaining('Refresh Retreat'),
        expect.stringContaining('Cru National Conference'),
        expect.stringContaining('Subtotal'),
        'Subtotal with Admin AssessmentDivide line 5 by 0.88',
        expect.stringContaining('Special Needs Developed to Date'),
        expect.stringContaining('Special Needs to be Developed'),
      ],
      cells: [
        ['1', '—'],
        ['2', '—'],
        ['3', '—'],
        ['4', '—'],
        ['5', '—'],
        ['6', '—'],
        ['7', '—'],
        ['8', '—'],
      ],
    });
  });
});
