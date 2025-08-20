import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { GoalCalculationQuery } from '../../../Shared/GoalCalculation.generated';
import { UpdateGoalCalculationMutation } from './GoalCalculation.generated';
import { SettingsCategory } from './SettingsCategory';

const router = {
  query: {
    accountListId: 'test-account-list-id',
    goalCalculationId: 'test-goal-calculation-id',
  },
};
const TestComponent = () => (
  <TestRouter router={router}>
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <GqlMockedProvider<{
          GoalCalculation: GoalCalculationQuery;
          UpdateGoalCalculation: UpdateGoalCalculationMutation;
        }>
          mocks={{
            GoalCalculation: {
              goalCalculation: {
                name: 'Initial Goal Name',
              },
            },
            UpdateGoalCalculation: {
              updateGoalCalculation: {
                goalCalculation: {
                  id: 'test-goal-calculation-id',
                  name: 'Updated Goal Name',
                },
              },
            },
          }}
        >
          <SettingsCategory />
        </GqlMockedProvider>
      </SnackbarProvider>
    </ThemeProvider>
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
