import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from 'src/theme';
import { GoalCard, GoalCardProps } from './GoalCard';

const mutationSpy = jest.fn();

const baseProps: GoalCardProps = {
  name: 'Test Goal',
  goalAmount: 1234.56,
  currency: 'USD',
  updatedAt: '2026-03-15T00:00:00Z',
  viewHref: '/some/view/path',
  onDelete: mutationSpy,
};

const renderCard = (props: Partial<GoalCardProps> = {}) =>
  render(
    <ThemeProvider theme={theme}>
      <GoalCard {...baseProps} {...props} />
    </ThemeProvider>,
  );

describe('GoalCard', () => {
  it('renders the goal name, amount, and last updated date', () => {
    const { getByTestId } = renderCard();

    expect(getByTestId('goal-name')).toHaveTextContent('Test Goal');
    expect(getByTestId('goal-amount-value')).toHaveTextContent('$1,234.56');
    expect(getByTestId('date-value')).toHaveTextContent('March 15');
  });

  it('falls back to "Unnamed Goal" when name is null', () => {
    const { getByTestId } = renderCard({ name: null });

    expect(getByTestId('goal-name')).toHaveTextContent('Unnamed Goal');
  });

  it('shows the full goal name in a tooltip on hover', async () => {
    const longName =
      'A very long goal name that would otherwise stretch the card';
    const { getByTestId, findByRole } = renderCard({ name: longName });

    userEvent.hover(getByTestId('goal-name'));

    expect((await findByRole('tooltip')).textContent).toBe(longName);
  });

  it('shows the unnamed goal fallback in a tooltip on hover', async () => {
    const { getByTestId, findByRole } = renderCard({ name: null });

    userEvent.hover(getByTestId('goal-name'));

    expect((await findByRole('tooltip')).textContent).toBe('Unnamed Goal');
  });

  it('renders the View link with the provided href', () => {
    const { getByRole } = renderCard({ viewHref: '/custom/href' });

    expect(getByRole('link', { name: 'View' })).toHaveAttribute(
      'href',
      '/custom/href',
    );
  });

  it('formats the goal amount in the supplied currency', () => {
    const { getByTestId } = renderCard({ goalAmount: 2500, currency: 'EUR' });

    expect(getByTestId('goal-amount-value')).toHaveTextContent('€2,500');
  });

  it('renders a skeleton in place of the amount when loading', () => {
    const { getByTestId, queryByText } = renderCard({ loading: true });

    expect(
      getByTestId('goal-amount-value').querySelector('.MuiSkeleton-root'),
    ).toBeInTheDocument();
    expect(queryByText('$1,234.56')).not.toBeInTheDocument();
  });

  it('opens the confirmation dialog and calls onDelete when confirmed', () => {
    const { getByRole } = renderCard();

    userEvent.click(getByRole('button', { name: 'Delete' }));
    userEvent.click(getByRole('button', { name: 'Delete Goal' }));

    expect(mutationSpy).toHaveBeenCalledTimes(1);
  });

  it('does not call onDelete when the confirmation is cancelled', () => {
    const { getByRole } = renderCard();

    userEvent.click(getByRole('button', { name: 'Delete' }));
    userEvent.click(getByRole('button', { name: 'Cancel' }));

    expect(mutationSpy).not.toHaveBeenCalled();
  });
});
