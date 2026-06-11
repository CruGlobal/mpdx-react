import React from 'react';
import { render } from '@testing-library/react';
import { SpecialNeedsCard } from './SpecialNeedsCard';

describe('SpecialNeedsCard', () => {
  it('renders the card title and special needs goal', () => {
    const { getByRole, getByText } = render(
      <SpecialNeedsCard specialNeeds={3624} />,
    );

    expect(getByRole('heading', { name: 'Special Needs' })).toBeInTheDocument();
    expect(getByText('Total Special Needs Goal')).toBeInTheDocument();
    expect(
      getByText(
        'NSO/IBS Tuition, housing, food, travel, MPD Refresh Retreat, Faith & Finance Course.',
      ),
    ).toBeInTheDocument();
    expect(getByText('$3,624')).toBeInTheDocument();
  });
});
