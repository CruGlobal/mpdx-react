import { renderHook, waitFor } from '@testing-library/react';
import { GoalCalculatorTestWrapper } from '../../../GoalCalculatorTestWrapper';
import { useSaveField } from './useSaveField';

const mutationSpy = jest.fn();

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <GoalCalculatorTestWrapper onCall={mutationSpy}>
    {children}
  </GoalCalculatorTestWrapper>
);

describe('useSaveField', () => {
  it('should call updateGoalCalculation with correct parameters', async () => {
    const { result } = renderHook(() => useSaveField(), {
      wrapper: Wrapper,
    });

    // Wait for the goal calculation to load
    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('GoalCalculation'),
    );

    result.current({ name: 'New Name' });

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdateGoalCalculation', {
        input: {
          accountListId: 'account-list-1',
          attributes: {
            id: 'test-goal-id',
            name: 'New Name',
          },
        },
      }),
    );
  });
});
