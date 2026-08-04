import { renderHook, waitFor } from '@testing-library/react';
import { GoalCalculatorTestWrapper } from '../../../GoalCalculatorTestWrapper';
import { useGoalCalculator } from '../../../Shared/GoalCalculatorContext';
import { useSaveField } from './useSaveField';

const mutationSpy = jest.fn();

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <GoalCalculatorTestWrapper onCall={mutationSpy}>
    {children}
  </GoalCalculatorTestWrapper>
);

// Expose the loaded goal alongside saveField so the tests can wait for the data
// to arrive — saveField silently no-ops until the goal calculation has loaded
const useTestHooks = () => ({
  saveField: useSaveField(),
  goalCalculation:
    useGoalCalculator().goalCalculationResult.data?.goalCalculation,
});

describe('useSaveField', () => {
  it('should update goal calculation', async () => {
    const { result } = renderHook(useTestHooks, { wrapper: Wrapper });

    // Wait for the goal calculation to load
    await waitFor(() => expect(result.current.goalCalculation).toBeDefined());

    result.current.saveField({ name: 'New Name' });

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdateGoalCalculation', {
        input: {
          accountListId: 'account-list-1',
          attributes: {
            id: 'goal-calculation-1',
            name: 'New Name',
          },
        },
      }),
    );
  });

  it('should not update goal calculation when no attributes changed', async () => {
    const { result } = renderHook(useTestHooks, { wrapper: Wrapper });

    // Wait for the goal calculation to load
    await waitFor(() => expect(result.current.goalCalculation).toBeDefined());

    result.current.saveField({ name: 'Initial Goal Name', firstName: 'John' });

    await Promise.resolve();
    await waitFor(() =>
      expect(mutationSpy).not.toHaveGraphqlOperation('UpdateGoalCalculation'),
    );
  });
});
