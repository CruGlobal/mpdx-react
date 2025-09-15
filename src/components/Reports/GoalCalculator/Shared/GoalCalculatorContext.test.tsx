import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { gqlMock } from '__tests__/util/graphqlMocking';
import { GoalCalculatorStepEnum } from '../GoalCalculatorHelper';
import { GoalCalculatorTestWrapper } from '../GoalCalculatorTestWrapper';
import {
  BudgetFamilyFragment,
  BudgetFamilyFragmentDoc,
} from './GoalCalculation.generated';
import { useGoalCalculator } from './GoalCalculatorContext';

const sleep = (duration: number) =>
  new Promise((resolve) => setTimeout(resolve, duration));

const TestComponent: React.FC = () => {
  const {
    currentStep,
    isDrawerOpen,
    handleStepChange,
    handleContinue,
    toggleDrawer,
    trackMutation,
    isMutating,
  } = useGoalCalculator();

  return (
    <div>
      <h2>{currentStep?.title}</h2>
      <div aria-label="drawer state" data-open={isDrawerOpen}>
        Drawer: {isDrawerOpen ? 'open' : 'closed'}
      </div>
      <button
        onClick={() =>
          handleStepChange(GoalCalculatorStepEnum.HouseholdExpenses)
        }
      >
        Change Step
      </button>
      <button onClick={handleContinue}>Continue</button>
      <button onClick={toggleDrawer}>Toggle Drawer</button>

      <button onClick={() => trackMutation(sleep(100))}>Start mutation</button>
      <button onClick={() => trackMutation(sleep(5000))}>
        Start slow mutation
      </button>
      <p data-testid="mutating-status">
        {isMutating ? 'Mutating' : 'Not mutating'}
      </p>
    </div>
  );
};

const WrappedTestComponent: React.FC = () => (
  <GoalCalculatorTestWrapper>
    <TestComponent />
  </GoalCalculatorTestWrapper>
);

describe('GoalCalculatorContext', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  it('should provide initial state', () => {
    const { getByRole } = render(<WrappedTestComponent />);

    expect(getByRole('heading')).toHaveTextContent('Calculator Settings');
  });

  it('should handle step change', () => {
    const { getByRole } = render(<WrappedTestComponent />);

    userEvent.click(getByRole('button', { name: 'Change Step' }));
    expect(getByRole('heading')).toHaveTextContent('Household Expenses');
  });

  it('should handle continue to next step', () => {
    const { getByRole } = render(<WrappedTestComponent />);

    userEvent.click(getByRole('button', { name: 'Continue' }));
    expect(getByRole('heading')).toHaveTextContent('Ministry Expenses');
  });

  it('should toggle drawer state', () => {
    const { getByRole, getByLabelText } = render(<WrappedTestComponent />);

    const drawerState = getByLabelText('drawer state');
    expect(drawerState).toHaveAttribute('data-open', 'true');

    userEvent.click(getByRole('button', { name: 'Toggle Drawer' }));
    expect(drawerState).toHaveAttribute('data-open', 'false');
  });

  it('should track pending mutations', async () => {
    const { getByRole, getByTestId } = render(<WrappedTestComponent />);

    userEvent.click(getByRole('button', { name: 'Start mutation' }));
    userEvent.click(getByRole('button', { name: 'Start slow mutation' }));
    expect(getByTestId('mutating-status')).toHaveTextContent('Mutating');

    jest.advanceTimersByTime(500);
    expect(getByTestId('mutating-status')).toHaveTextContent('Mutating');

    jest.advanceTimersByTime(10000);
    await waitFor(() =>
      expect(getByTestId('mutating-status')).toHaveTextContent('Not mutating'),
    );
  });

  describe('percentComplete', () => {
    it('should calculate percentage with mixed completion states', async () => {
      let percentComplete: number | undefined;
      const TestPercentComplete: React.FC = () => {
        const context = useGoalCalculator();
        percentComplete = context.percentComplete;
        return null;
      };

      render(
        <GoalCalculatorTestWrapper>
          <TestPercentComplete />
        </GoalCalculatorTestWrapper>,
      );

      await waitFor(() => {
        expect(percentComplete).toEqual(100);
      });
    });
  });

  describe('getFamilySections', () => {
    it('should calculate completion status', () => {
      let getFamilySections:
        | ((
            budgetFamily: BudgetFamilyFragment,
          ) => { title: string; complete: boolean }[])
        | undefined;

      const TestGetFamilySections: React.FC = () => {
        const context = useGoalCalculator();
        getFamilySections = context.getFamilySections;
        return null;
      };

      render(
        <GoalCalculatorTestWrapper>
          <TestGetFamilySections />
        </GoalCalculatorTestWrapper>,
      );

      const budgetFamily = gqlMock<BudgetFamilyFragment>(
        BudgetFamilyFragmentDoc,
        {
          mocks: {
            primaryBudgetCategories: [
              {
                label: 'Incomplete',
                directInput: null,
                subBudgetCategories: [{ amount: 0 }, { amount: 0 }],
              },
              {
                label: 'Direct input',
                directInput: 1000,
                subBudgetCategories: [{ amount: 0 }, { amount: 0 }],
              },
              {
                label: 'Complete',
                directInput: null,
                subBudgetCategories: [{ amount: 100 }, { amount: 0 }],
              },
            ],
          },
        },
      );

      expect(getFamilySections!(budgetFamily)).toEqual([
        { title: 'Incomplete', complete: false },
        { title: 'Direct input', complete: true },
        { title: 'Complete', complete: true },
      ]);
    });
  });
});
