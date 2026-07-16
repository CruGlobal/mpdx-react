import React from 'react';
import { render } from '@testing-library/react';
import { GoalSummaryCard } from './GoalSummaryCard';

describe('GoalSummaryCard', () => {
  it('renders the headline figures and "Coming soon" for special needs', () => {
    const { getByText, getByRole } = render(
      <GoalSummaryCard
        monthlyGoal={6430.25}
        specialNeedsGoal={null}
        minStaffAccountBalance={9580}
        supportRaised={2000}
        accountBalance={5000}
      />,
    );

    expect(
      getByRole('heading', { name: 'Your MPD Goal Calculation' }),
    ).toBeInTheDocument();

    expect(getByText('Monthly MPD Goal')).toBeInTheDocument();
    expect(getByText('$6,430.25')).toBeInTheDocument();

    expect(getByText('Special Needs Goal')).toBeInTheDocument();
    expect(getByText('Coming soon')).toBeInTheDocument();

    expect(
      getByText('Min Staff Account Balance to Report'),
    ).toBeInTheDocument();
    expect(getByText('$9,580.00')).toBeInTheDocument();
  });

  it('renders "To be Developed" as the goal minus support raised', () => {
    const { getByText } = render(
      <GoalSummaryCard
        monthlyGoal={6430.25}
        specialNeedsGoal={null}
        minStaffAccountBalance={9580}
        supportRaised={2000}
        accountBalance={5000}
      />,
    );

    expect(getByText('To be Developed: $4,430.25')).toBeInTheDocument();
  });

  it('renders "Current Balance" from the account balance', () => {
    const { getByText } = render(
      <GoalSummaryCard
        monthlyGoal={6430.25}
        specialNeedsGoal={null}
        minStaffAccountBalance={9580}
        supportRaised={2000}
        accountBalance={5000}
      />,
    );

    expect(getByText('Current Balance: $5,000.00')).toBeInTheDocument();
  });

  it('clamps "To be Developed" to $0.00 when support raised exceeds the goal', () => {
    const { getByText } = render(
      <GoalSummaryCard
        monthlyGoal={2000}
        specialNeedsGoal={null}
        minStaffAccountBalance={9580}
        supportRaised={5000}
        accountBalance={5000}
      />,
    );

    expect(getByText('To be Developed: $0.00')).toBeInTheDocument();
  });

  it('omits the sub-figures on a scenario goal (no account list)', () => {
    const { queryByText } = render(
      <GoalSummaryCard
        monthlyGoal={6430.25}
        specialNeedsGoal={null}
        minStaffAccountBalance={9580}
        supportRaised={null}
        accountBalance={null}
      />,
    );

    expect(queryByText(/To be Developed/)).not.toBeInTheDocument();
    expect(queryByText(/Current Balance/)).not.toBeInTheDocument();
  });

  it('renders a real special-needs figure as currency once available', () => {
    const { getByText } = render(
      <GoalSummaryCard
        monthlyGoal={6430.25}
        specialNeedsGoal={2801}
        minStaffAccountBalance={9580}
        supportRaised={2000}
        accountBalance={5000}
      />,
    );

    expect(getByText('$2,801.00')).toBeInTheDocument();
  });

  it('renders zero figures as currency rather than blanks', () => {
    const { getAllByText, getByText } = render(
      <GoalSummaryCard
        monthlyGoal={0}
        specialNeedsGoal={0}
        minStaffAccountBalance={0}
        supportRaised={0}
        accountBalance={0}
      />,
    );

    // The three headline figures each render "$0.00".
    expect(getAllByText('$0.00')).toHaveLength(3);
    // The sub-figures render inline with their label.
    expect(getByText('To be Developed: $0.00')).toBeInTheDocument();
    expect(getByText('Current Balance: $0.00')).toBeInTheDocument();
  });
});
