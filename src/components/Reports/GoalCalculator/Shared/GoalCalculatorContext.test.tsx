import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GoalCalculatorStepEnum } from '../GoalCalculatorHelper';
import { GoalCalculatorTestWrapper } from '../GoalCalculatorTestWrapper';
import { useGoalCalculator } from './GoalCalculatorContext';

const TestComponent: React.FC = () => {
  const {
    currentStep,
    isDrawerOpen,
    handleStepChange,
    handleContinue,
    toggleDrawer,
    onMutationStart,
    onMutationComplete,
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

      <button onClick={onMutationStart}>Start mutation</button>
      <button onClick={onMutationComplete}>Complete mutation</button>
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

  it('should track pending mutations', () => {
    const { getByRole, getByTestId } = render(<WrappedTestComponent />);

    userEvent.click(getByRole('button', { name: 'Start mutation' }));
    userEvent.click(getByRole('button', { name: 'Start mutation' }));

    expect(getByTestId('mutating-status')).toHaveTextContent('Mutating');

    userEvent.click(getByRole('button', { name: 'Complete mutation' }));
    expect(getByTestId('mutating-status')).toHaveTextContent('Mutating');

    userEvent.click(getByRole('button', { name: 'Complete mutation' }));
    expect(getByTestId('mutating-status')).toHaveTextContent('Not mutating');
  });
});
