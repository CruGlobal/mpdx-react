import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GoalCalculatorStepEnum } from '../GoalCalculatorHelper';
import { GoalCalculatorTestWrapper } from '../GoalCalculatorTestWrapper';
import { useGoalCalculator } from './GoalCalculatorContext';

const sleep = (duration: number) =>
  new Promise((resolve) => setTimeout(resolve, duration));

const mutationThunk = jest.fn(() => sleep(100));

const TestComponent: React.FC = () => {
  const {
    currentStep,
    isDrawerOpen,
    handleStepChange,
    handleContinue,
    toggleDrawer,
    trackMutation,
    isMutating,
    isReadOnly,
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

      <button onClick={() => trackMutation(() => sleep(100))}>
        Start mutation
      </button>
      <button onClick={() => trackMutation(() => sleep(5000))}>
        Start slow mutation
      </button>
      <button onClick={() => trackMutation(mutationThunk)}>
        Track mutation thunk
      </button>
      <p data-testid="mutating-status">
        {isMutating ? 'Mutating' : 'Not mutating'}
      </p>
      <p data-testid="read-only-status">
        {isReadOnly ? 'Read-only' : 'Editable'}
      </p>
    </div>
  );
};

interface WrappedTestComponentProps {
  readOnly?: boolean;
}

const WrappedTestComponent: React.FC<WrappedTestComponentProps> = ({
  readOnly,
}) => (
  <GoalCalculatorTestWrapper readOnly={readOnly}>
    <TestComponent />
  </GoalCalculatorTestWrapper>
);

describe('GoalCalculatorContext', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mutationThunk.mockClear();
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

  it('isReadOnly defaults to false while the goal is loading', () => {
    const { getByTestId } = render(<WrappedTestComponent />);

    // Before the query resolves, goal data is absent and isReadOnly falls back to false
    expect(getByTestId('read-only-status')).toHaveTextContent('Editable');
  });

  it('isReadOnly is true when the goal is read-only', async () => {
    const { getByTestId } = render(
      <GoalCalculatorTestWrapper readOnly>
        <TestComponent />
      </GoalCalculatorTestWrapper>,
    );

    await waitFor(() =>
      expect(getByTestId('read-only-status')).toHaveTextContent('Read-only'),
    );
  });

  describe('trackMutation read-only guard', () => {
    it('invokes the mutation thunk when the goal is not read-only', async () => {
      const { getByRole, getByTestId } = render(<WrappedTestComponent />);

      await waitFor(() =>
        expect(getByTestId('read-only-status')).toHaveTextContent('Editable'),
      );

      userEvent.click(getByRole('button', { name: 'Track mutation thunk' }));
      expect(mutationThunk).toHaveBeenCalledTimes(1);
      expect(getByTestId('mutating-status')).toHaveTextContent('Mutating');

      jest.advanceTimersByTime(500);
      await waitFor(() =>
        expect(getByTestId('mutating-status')).toHaveTextContent(
          'Not mutating',
        ),
      );
    });

    it('does not invoke the mutation thunk when the goal is read-only', async () => {
      const { getByRole, getByTestId } = render(
        <WrappedTestComponent readOnly />,
      );

      await waitFor(() =>
        expect(getByTestId('read-only-status')).toHaveTextContent('Read-only'),
      );

      userEvent.click(getByRole('button', { name: 'Track mutation thunk' }));
      expect(mutationThunk).not.toHaveBeenCalled();
      expect(getByTestId('mutating-status')).toHaveTextContent('Not mutating');
    });
  });
});
