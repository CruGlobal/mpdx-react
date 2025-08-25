import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { CreateGoalCalculationMutation } from './CreateGoalCalculation.generated';
import { createGoalCalculationMock } from './CreateGoalCalculation.mock';
import { GoalsList } from './GoalsList';

const mockRouter = {
  push: jest.fn(),
  query: { accountListId: 'account-123' },
};

jest.mock('next/router', () => ({
  useRouter: () => mockRouter,
}));

const TestComponent = () => (
  <ThemeProvider theme={theme}>
    <TestRouter
      router={{
        query: {
          accountListId: 'account-list-1',
          goalCalculatorId: 'goal-calculator-1',
        },
      }}
    >
      <SnackbarProvider>
        <GqlMockedProvider<{
          CreateGoalCalculation: CreateGoalCalculationMutation;
        }>
          mocks={{
            CreateGoalCalculation: createGoalCalculationMock(),
          }}
        >
          <GoalsList />
        </GqlMockedProvider>
      </SnackbarProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('GoalsList', () => {
  it('renders the header and buttons', async () => {
    const { getByRole } = render(<TestComponent />);

    expect(
      getByRole('heading', { name: 'Good Morning, User.' }),
    ).toBeInTheDocument();
    expect(
      getByRole('button', { name: 'Create a New Goal' }),
    ).toBeInTheDocument();
    expect(
      getByRole('button', { name: 'Learn About Goalsetting' }),
    ).toBeInTheDocument();
  });

  it('creates a goal calculation and navigates to it when Create a New Goal is clicked', async () => {
    const { getByRole } = render(<TestComponent />);
    const createButton = getByRole('button', { name: 'Create a New Goal' });

    userEvent.click(createButton);

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith(
        `/accountLists/account-123/reports/goalCalculator/1234`,
      );
    });
  });
});
