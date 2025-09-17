import React from 'react';
import { ThemeProvider } from '@mui/system';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { BudgetFamilyCategoryEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { ListGoalCalculationFragment } from '../GoalsList/GoalCalculations.generated';
import { GoalCard } from './GoalCard';
import { useGoalCardCalculations } from './useGoalCardCalculations';

jest.mock('./useGoalCardCalculations');
const mockUseGoalCardCalculations = jest.mocked(useGoalCardCalculations);

const goal: ListGoalCalculationFragment = {
  id: 'goal-1',
  updatedAt: '2025-01-01T00:00:00.000Z',
  primary: false,
  ministryFamily: {
    __typename: 'BudgetFamily',
    id: 'budget-family-1',
    label: 'Test Budget Family',
    category: BudgetFamilyCategoryEnum.Ministry,
    directInput: 0,
    updatedAt: '2025-01-01T00:00:00.000Z',
    primaryBudgetCategories: [],
  },
  householdFamily: {
    __typename: 'BudgetFamily',
    id: 'budget-family-2',
    label: 'Household Budget Family',
    category: BudgetFamilyCategoryEnum.Household,
    directInput: 0,
    updatedAt: '2025-01-01T00:00:00.000Z',
    primaryBudgetCategories: [],
  },
};
const mutationSpy = jest.fn();

interface TestComponentProps {
  primary?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({ primary = false }) => (
  <TestRouter
    router={{
      query: {
        accountListId: 'account-list-1',
      },
    }}
  >
    <ThemeProvider theme={theme}>
      <GqlMockedProvider onCall={mutationSpy}>
        <GoalCard goal={{ ...goal, primary }} renderStar />
      </GqlMockedProvider>
    </ThemeProvider>
  </TestRouter>
);

describe('GoalCard', () => {
  beforeEach(() => {
    mockUseGoalCardCalculations.mockReturnValue({
      overallTotal: 12500.75,
    });
  });

  it('renders goal title, amount, and date', () => {
    const { getByTestId } = render(<TestComponent />);
    expect(getByTestId('goal-name')).toBeInTheDocument();
    expect(getByTestId('goal-amount-value')).toBeInTheDocument();
    expect(getByTestId('date-value')).toBeInTheDocument();
  });

  it('calls update mutation when star button is clicked', async () => {
    const { getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'star-button' }));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdateGoalCalculation', {
        accountListId: 'account-list-1',
        attributes: {
          id: 'goal-1',
          primary: true,
        },
      }),
    );
  });

  it('shows filled star when primary', () => {
    const { getByTestId } = render(<TestComponent primary={true} />);
    expect(getByTestId('StarIcon')).toBeInTheDocument();
  });

  it('shows outlined star when not primary', () => {
    const { getByTestId } = render(<TestComponent primary={false} />);
    expect(getByTestId('StarBorderOutlinedIcon')).toBeInTheDocument();
  });

  it('opens confirmation dialog and calls delete mutation when delete button is clicked', async () => {
    const { getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Delete' }));
    userEvent.click(getByRole('button', { name: 'Delete Goal' }));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('DeleteGoalCalculation', {
        accountListId: 'account-list-1',
        id: 'goal-1',
      }),
    );
  });

  it('renders view link', async () => {
    const { getByRole } = render(<TestComponent />);
    expect(getByRole('link', { name: 'View' })).toHaveAttribute(
      'href',
      '/accountLists/account-list-1/reports/goalCalculator/goal-1',
    );
  });

  it('shows a goal amount value', async () => {
    const { getByTestId } = render(<TestComponent />);

    expect(getByTestId('goal-amount-value')).toHaveTextContent('$12,500.75');
    expect(mockUseGoalCardCalculations).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'goal-1',
        primary: false,
      }),
    );
  });
});
