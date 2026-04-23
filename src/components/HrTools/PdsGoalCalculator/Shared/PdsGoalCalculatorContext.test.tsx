import React from 'react';
import { act, renderHook } from '@testing-library/react';
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

  it('handleContinue advances to the next step', () => {
    const { result } = renderHook(() => usePdsGoalCalculator(), {
      wrapper: ({ children }) => (
        <PdsGoalCalculatorTestWrapper>{children}</PdsGoalCalculatorTestWrapper>
      ),
    });

    expect(result.current.stepIndex).toBe(0);

    act(() => result.current.handleContinue());
    expect(result.current.stepIndex).toBe(1);
  });

  it('handlePreviousStep goes back to the previous step', () => {
    const { result } = renderHook(() => usePdsGoalCalculator(), {
      wrapper: ({ children }) => (
        <PdsGoalCalculatorTestWrapper>{children}</PdsGoalCalculatorTestWrapper>
      ),
    });

    act(() => result.current.handleContinue());
    expect(result.current.stepIndex).toBe(1);

    act(() => result.current.handlePreviousStep());
    expect(result.current.stepIndex).toBe(0);
  });

  it('handlePreviousStep does nothing on the first step', () => {
    const { result } = renderHook(() => usePdsGoalCalculator(), {
      wrapper: ({ children }) => (
        <PdsGoalCalculatorTestWrapper>{children}</PdsGoalCalculatorTestWrapper>
      ),
    });

    expect(result.current.stepIndex).toBe(0);

    act(() => result.current.handlePreviousStep());
    expect(result.current.stepIndex).toBe(0);
  });
});
