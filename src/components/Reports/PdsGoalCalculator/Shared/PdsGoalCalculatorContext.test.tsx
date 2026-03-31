import React from 'react';
import { renderHook } from '@testing-library/react';
import { PdsGoalCalculatorTestWrapper } from '../PdsGoalCalculatorTestWrapper';
import { usePdsGoalCalculator } from './PdsGoalCalculatorContext';

describe('PdsGoalCalculatorContext', () => {
  it('provides steps and current step', () => {
    const { result } = renderHook(() => usePdsGoalCalculator(), {
      wrapper: ({ children }) => (
        <PdsGoalCalculatorTestWrapper>{children}</PdsGoalCalculatorTestWrapper>
      ),
    });

    expect(result.current.steps).toHaveLength(4);
    expect(result.current.currentStep.step).toBe('setup');
  });

  it('throws when used outside provider', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => usePdsGoalCalculator())).toThrow(
      'Could not find PdsGoalCalculatorContext',
    );
    jest.restoreAllMocks();
  });
});
