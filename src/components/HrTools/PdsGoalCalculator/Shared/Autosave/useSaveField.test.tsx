import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { UpdatePdsGoalCalculationMutation } from '../../GoalsList/PdsGoalCalculations.generated';
import {
  PdsGoalCalculatorTestWrapper,
  PdsGoalCalculatorTestWrapperProps,
} from '../../PdsGoalCalculatorTestWrapper';
import { useSaveField } from './useSaveField';

type WrapperExtraMocks = {
  UpdatePdsGoalCalculation: UpdatePdsGoalCalculationMutation;
};

const mutationSpy = jest.fn();
const mockEnqueue = jest.fn();

jest.mock('notistack', () => ({
  ...jest.requireActual('notistack'),
  useSnackbar: () => ({
    enqueueSnackbar: mockEnqueue,
  }),
}));

beforeEach(() => {
  mutationSpy.mockClear();
  mockEnqueue.mockClear();
});

interface WrapperProps {
  children: React.ReactNode;
  extraMocks?: PdsGoalCalculatorTestWrapperProps<WrapperExtraMocks>['extraMocks'];
}

const Wrapper: React.FC<WrapperProps> = ({ children, extraMocks }) => (
  <PdsGoalCalculatorTestWrapper<WrapperExtraMocks>
    calculationMock={{
      id: 'goal-1',
      name: 'Test Goal',
      payRate: 50000,
    }}
    onCall={mutationSpy}
    extraMocks={extraMocks}
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

  it('shows an error snackbar when the mutation fails', async () => {
    const { result } = renderHook(useSaveField, {
      wrapper: ({ children }) => (
        <Wrapper
          extraMocks={{
            UpdatePdsGoalCalculation: () => {
              throw new Error('Server Error');
            },
          }}
        >
          {children}
        </Wrapper>
      ),
    });

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('PdsGoalCalculation'),
    );

    await result.current({ name: 'New Name' });

    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Failed to save changes. Please try again.',
        { variant: 'error' },
      ),
    );
  });
});
