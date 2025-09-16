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
const mutationSpy = jest.fn();

const TestComponent = () => (
  <TestRouter router={router}>
    <GoalCalculatorTestWrapper onCall={mutationSpy}>
      <SettingsCategory />
    </GoalCalculatorTestWrapper>
  </TestRouter>
);

describe('SettingsCategory', () => {
  it('renders goal title input field', () => {
    const { getByRole } = render(<TestComponent />);
    expect(getByRole('textbox', { name: 'Goal Name' })).toBeInTheDocument();
  });

  it('displays initial goal title from query after loading', async () => {
    const { getByRole } = render(<TestComponent />);
    const input = getByRole('textbox', { name: 'Goal Name' });
    await waitFor(() => expect(input).toHaveValue('Initial Goal Name'));
  });

  it('calls mutation on blur with valid input', async () => {
    const { getByRole } = render(<TestComponent />);
    const input = getByRole('textbox', { name: 'Goal Name' });

    await waitFor(() => expect(input).toHaveValue('Initial Goal Name'));

    userEvent.clear(input);
    userEvent.type(input, 'Valid Goal');
    userEvent.tab();

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdateGoalCalculation', {
        input: {
          accountListId: 'account-list-1',
          attributes: {
            id: 'test-goal-id',
            name: 'Valid Goal',
          },
        },
      }),
    );
  });

  it('handles onChange successfully', async () => {
    const { getByRole } = render(<TestComponent />);
    const input = getByRole('textbox', { name: 'Goal Name' });

    await waitFor(() => expect(input).toHaveValue('Initial Goal Name'));
    userEvent.type(input, ' Updated');
    expect(input).toHaveValue('Initial Goal Name Updated');
  });
});
