import React from 'react';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateTime } from 'luxon';
import { GoalCard } from './GoalCard';

const TestComponent: React.FC<React.ComponentProps<typeof GoalCard>> = (
  props,
) => (
  <LocalizationProvider dateAdapter={AdapterLuxon}>
    <GoalCard {...props} />
  </LocalizationProvider>
);

describe('GoalCard', () => {
  const defaultProps = {
    goalId: 1,
    goalTitle: 'Test Goal',
    goalAmount: 1000,
    goalDate: DateTime.fromISO('2024-06-01'),
    starred: false,
    onStarToggle: jest.fn(),
    onDelete: jest.fn(),
    onView: jest.fn(),
  };

  it('renders goal title, amount, and date', () => {
    const { getByText } = render(<TestComponent {...defaultProps} />);
    expect(getByText('Test Goal')).toBeInTheDocument();
    expect(
      getByText((content) => content.includes('1,000')),
    ).toBeInTheDocument();
    expect(getByText('June 1, 2024')).toBeInTheDocument();
  });

  it('renders Delete and View buttons', () => {
    const { getByText } = render(<TestComponent {...defaultProps} />);
    expect(getByText('Delete')).toBeInTheDocument();
    expect(getByText('View')).toBeInTheDocument();
  });

  it('calls onStarToggle when star button is clicked', async () => {
    const { getByRole } = render(<TestComponent {...defaultProps} />);
    const starButton = getByRole('button', { name: '' });
    userEvent.click(starButton);
    expect(defaultProps.onStarToggle).toHaveBeenCalledWith(1);
  });

  it('shows filled star when starred is true', () => {
    const { getByTestId } = render(
      <TestComponent {...defaultProps} starred={true} />,
    );
    expect(getByTestId('StarIcon')).toBeInTheDocument();
  });

  it('shows outlined star when starred is false', () => {
    const { getByTestId } = render(
      <TestComponent {...defaultProps} starred={false} />,
    );
    expect(getByTestId('StarBorderOutlinedIcon')).toBeInTheDocument();
  });

  it('calls onDelete when Delete button is clicked', async () => {
    const { getByRole } = render(<TestComponent {...defaultProps} />);
    userEvent.click(getByRole('button', { name: 'Delete' }));
    expect(defaultProps.onDelete).toHaveBeenCalledWith(1);
  });

  it('calls onView when View button is clicked', async () => {
    const { getByRole } = render(<TestComponent {...defaultProps} />);
    userEvent.click(getByRole('button', { name: 'View' }));
    expect(defaultProps.onView).toHaveBeenCalledWith(1);
  });
});
