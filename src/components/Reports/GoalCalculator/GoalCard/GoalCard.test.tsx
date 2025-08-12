import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateTime } from 'luxon';
import { GoalCard, GoalCardProps } from './GoalCard';

const onStarToggle = jest.fn();
const onDelete = jest.fn();
const onView = jest.fn();
const TestComponent: React.FC<Partial<GoalCardProps>> = (props) => (
  <GoalCard
    goalId={1}
    goalTitle="Test Goal"
    goalAmount={1000}
    goalDate={DateTime.fromISO('2024-06-01')}
    starred={false}
    onStarToggle={onStarToggle}
    onDelete={onDelete}
    onView={onView}
    {...props}
  />
);

describe('GoalCard', () => {
  it('renders goal title, amount, and date', () => {
    const { getByTestId } = render(<TestComponent />);
    expect(getByTestId('goal-title')).toBeInTheDocument();
    expect(getByTestId('goal-amount-value')).toBeInTheDocument();
    expect(getByTestId('date-value')).toBeInTheDocument();
  });

  it('renders Delete and View buttons', () => {
    const { getByRole } = render(<TestComponent />);
    expect(getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'View' })).toBeInTheDocument();
  });

  it('calls onStarToggle when star button is clicked', async () => {
    const { getByRole } = render(<TestComponent />);
    const starButton = getByRole('button', { name: 'star-button' });
    userEvent.click(starButton);
    expect(onStarToggle).toHaveBeenCalledWith(1);
  });

  it('shows filled star when starred is true', () => {
    const { getByTestId } = render(<TestComponent starred={true} />);
    expect(getByTestId('StarIcon')).toBeInTheDocument();
  });

  it('shows outlined star when starred is false', () => {
    const { getByTestId } = render(<TestComponent starred={false} />);
    expect(getByTestId('StarBorderOutlinedIcon')).toBeInTheDocument();
  });

  it('calls onDelete when Delete button is clicked', async () => {
    const { getByRole } = render(<TestComponent />);
    userEvent.click(getByRole('button', { name: 'Delete' }));
    expect(onDelete).toHaveBeenCalledWith(1);
  });

  it('calls onView when View button is clicked', async () => {
    const { getByRole } = render(<TestComponent />);
    userEvent.click(getByRole('button', { name: 'View' }));
    expect(onView).toHaveBeenCalledWith(1);
  });
});
