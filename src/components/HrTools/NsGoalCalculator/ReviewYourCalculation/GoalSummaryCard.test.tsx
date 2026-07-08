import React from 'react';
import { render } from '@testing-library/react';
import { GoalSummaryCard } from './GoalSummaryCard';

describe('GoalSummaryCard', () => {
  it('renders the three headline figures', () => {
    const { getByText } = render(
      <GoalSummaryCard
        monthlyGoal={6430.25}
        specialNeedsGoal={2801}
        minStaffAccountBalance={9580}
      />,
    );

    expect(getByText('Your MPD Goal Calculation')).toBeInTheDocument();

    expect(getByText('Monthly MPD Goal')).toBeInTheDocument();
    expect(getByText('$6,430.25')).toBeInTheDocument();

    expect(getByText('Special Needs Goal')).toBeInTheDocument();
    expect(getByText('$2,801.00')).toBeInTheDocument();

    expect(
      getByText('Min Staff Account Balance to Report'),
    ).toBeInTheDocument();
    expect(getByText('$9,580.00')).toBeInTheDocument();
  });

  it('renders zero figures as currency rather than blanks', () => {
    const { getAllByText } = render(
      <GoalSummaryCard
        monthlyGoal={0}
        specialNeedsGoal={0}
        minStaffAccountBalance={0}
      />,
    );

    expect(getAllByText('$0.00')).toHaveLength(3);
  });
});
