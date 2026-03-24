import React from 'react';
import { renderHook } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import {
  PdsGoalCalculatorProvider,
  usePdsGoalCalculator,
} from './PdsGoalCalculatorContext';

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SnackbarProvider>
    <PdsGoalCalculatorProvider>{children}</PdsGoalCalculatorProvider>
  </SnackbarProvider>
);

describe('PdsGoalCalculatorContext', () => {
  it('provides steps and current step', () => {
    const { result } = renderHook(() => usePdsGoalCalculator(), { wrapper });

    expect(result.current.steps).toHaveLength(3);
    expect(result.current.currentStep.step).toBe('setup');
  });

  it('throws when used outside provider', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() =>
      renderHook(() => usePdsGoalCalculator()),
    ).toThrow(
      'Could not find PdsGoalCalculatorContext',
    );
    jest.restoreAllMocks();
  });
});
