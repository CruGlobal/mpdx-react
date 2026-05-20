import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { PdsGoalCalculatorTestWrapper } from '../../PdsGoalCalculatorTestWrapper';
import { usePdsGoalCalculator } from '../PdsGoalCalculatorContext';
import { useSaveField } from './useSaveField';

const mockEnqueue = jest.fn();
jest.mock('notistack', () => ({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ...jest.requireActual('notistack'),
  useSnackbar: () => ({ enqueueSnackbar: mockEnqueue }),
}));

const mutationSpy = jest.fn();

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PdsGoalCalculatorTestWrapper
    calculationMock={{
      id: 'goal-1',
      name: 'Test Goal',
      payRate: 50000,
    }}
    onCall={mutationSpy}
  >
    {children}
  </PdsGoalCalculatorTestWrapper>
);

const ErrorWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <PdsGoalCalculatorTestWrapper
    calculationMock={{
      id: 'goal-1',
      name: 'Test Goal',
      payRate: 50000,
    }}
    onCall={mutationSpy}
    updatePdsGoalCalculationError
  >
    {children}
  </PdsGoalCalculatorTestWrapper>
);

describe('useSaveField', () => {
  beforeEach(() => {
    mockEnqueue.mockClear();
    mutationSpy.mockClear();
  });

  it('should update the calculation when a value changes', async () => {
    const { result } = renderHook(useSaveField, { wrapper: Wrapper });

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('PdsGoalCalculation'),
    );

    result.current({ name: 'New Name' });

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdatePdsGoalCalculation', {
        attributes: {
          id: 'goal-1',
          name: 'New Name',
        },
      }),
    );
  });

  it('shows an error snackbar and rolls back the optimistic update when the mutation fails', async () => {
    const { result } = renderHook(
      () => ({
        saveField: useSaveField(),
        calculation: usePdsGoalCalculator().calculation,
      }),
      { wrapper: ErrorWrapper },
    );

    await waitFor(() =>
      expect(result.current.calculation?.name).toBe('Test Goal'),
    );

    let savePromise!: Promise<unknown>;
    act(() => {
      savePromise = result.current.saveField({ name: 'New Name' });
    });

    // The optimistic response is written to the cache immediately, so the
    // calculation in context briefly reflects the in-flight value.
    await waitFor(() =>
      expect(result.current.calculation?.name).toBe('New Name'),
    );

    await act(async () => {
      await expect(savePromise).rejects.toThrow();
    });

    // After the mutation fails, Apollo rolls the optimistic update back and
    // the cache returns to the original value.
    await waitFor(() =>
      expect(result.current.calculation?.name).toBe('Test Goal'),
    );

    expect(mockEnqueue).toHaveBeenCalledWith(
      'Failed to save changes. Please try again.',
      { variant: 'error' },
    );
  });
});
