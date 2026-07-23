import React from 'react';
import { render } from '@testing-library/react';
import { defaultGoalCalculation } from '../NsGoalCalculatorTestWrapper';
import { SpecialNeedsCard } from './SpecialNeedsCard';

const calculations = {
  ...defaultGoalCalculation.calculations,
  adminRate: 0.12,
  ibsNsoCost: 6165,
  faithAndFinanceCost: 520,
  refreshRetreatCost: 750,
  cruConferenceCost: 1200,
  specialNeedsSubtotal: 8635,
  specialNeedsTotal: 9812.5,
  specialNeedsDevelopedToDate: 500,
  specialNeedsLeft: 9312.5,
};

describe('SpecialNeedsCard', () => {
  it('renders every line with its server-computed amount', () => {
    const { getByRole } = render(
      <SpecialNeedsCard
        columnLabel="John & Jane"
        calculations={calculations}
      />,
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
        ['1', '$6,165.00'],
        ['2', '$520.00'],
        ['3', '$750.00'],
        ['4', '$1,200.00'],
        ['5', '$8,635.00'],
        ['6', '$9,812.50'],
        ['7', '$500.00'],
        ['8', '$9,312.50'],
      ],
    });
  });
});
