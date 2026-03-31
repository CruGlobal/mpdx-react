import React from 'react';
import { render } from '@testing-library/react';
import { PdsGoalCalculatorTestWrapper } from '../PdsGoalCalculatorTestWrapper';
import { PdsGoalCard } from './PdsGoalCard';

describe('PdsGoalCard', () => {
  it('renders the goal name and view link', () => {
    const { getByText } = render(
      <PdsGoalCalculatorTestWrapper withProvider={false}>
        <PdsGoalCard
          goal={{
            id: 'goal-1',
            name: 'Test PDS Goal',
            updatedAt: '2026-01-15T00:00:00Z',
          }}
        />
      </PdsGoalCalculatorTestWrapper>,
    );

    expect(getByText('Test PDS Goal')).toBeInTheDocument();
    expect(getByText('View')).toBeInTheDocument();
    expect(getByText('Delete')).toBeInTheDocument();
  });
});
