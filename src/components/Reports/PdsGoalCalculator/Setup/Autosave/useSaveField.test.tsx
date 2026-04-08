import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { PdsGoalCalculatorTestWrapper } from '../../PdsGoalCalculatorTestWrapper';
import { useSaveField } from './useSaveField';

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

describe('useSaveField', () => {
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
});
