import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GoalCalculatorTestWrapper } from '../../../GoalCalculatorTestWrapper';
import { SettingsCategory } from './SettingsCategory';

const router = {
  query: {
    accountListId: 'test-account-list-id',
    goalCalculationId: 'test-goal-calculation-id',
  },
};
const TestComponent = () => (
  <TestRouter router={router}>
    <GoalCalculatorTestWrapper>
          <SettingsCategory />
    </GoalCalculatorTestWrapper>
  </TestRouter>
);

describe('SettingsCategory', () => {
  it('renders goal title input field', () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('textbox', { name: 'Goal Title' })).toBeInTheDocument();
  });

  it('accepts valid input', () => {
    const { getByRole } = render(<TestComponent />);

    const input = getByRole('textbox', { name: 'Goal Title' });
    userEvent.type(input, 'My Goal');
    expect(input).toHaveValue('My Goal');
  });

  it('displays initial goal title from query after loading', async () => {
    const { getByRole } = render(<TestComponent />);

    const input = getByRole('textbox', { name: 'Goal Title' });

    await waitFor(
      () => {
        expect(input).toHaveValue('Initial Goal Name');
      },
      { timeout: 3000 },
    );
  });
});
