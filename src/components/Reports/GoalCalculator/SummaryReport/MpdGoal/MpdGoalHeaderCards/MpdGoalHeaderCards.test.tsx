import React from 'react';
import { render } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import { GoalCalculatorProvider } from 'src/components/Reports/GoalCalculator/Shared/GoalCalculatorContext';
import { MpdGoalHeaderCards } from './MpdGoalHeaderCards';

const mockGoal = {
  overallTotal: 10000,
  supportRaisedPercentage: 0.75,
};
const TestComponent = ({
  goal,
}: {
  goal: { overallTotal: number; supportRaisedPercentage: number };
}) => (
  <SnackbarProvider>
    <GoalCalculatorProvider>
      <MpdGoalHeaderCards goal={goal} />
    </GoalCalculatorProvider>
  </SnackbarProvider>
);

describe('MpdGoalHeaderCards', () => {
  it('renders the headings and values', () => {
    const { getByRole } = render(<TestComponent goal={mockGoal} />);
    expect(getByRole('heading', { name: 'Your Goal' })).toBeInTheDocument();
    expect(getByRole('heading', { name: '$10,000.00' })).toBeInTheDocument();
    expect(getByRole('heading', { name: 'Progress' })).toBeInTheDocument();
    expect(getByRole('heading', { name: '75%' })).toBeInTheDocument();
  });
});
