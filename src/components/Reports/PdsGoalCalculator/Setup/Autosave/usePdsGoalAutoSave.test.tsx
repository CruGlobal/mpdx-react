import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import * as yup from 'yup';
import {
  DesignationSupportSalaryType,
  DesignationSupportStatus,
} from 'src/graphql/types.generated';
import { PdsGoalCalculatorTestWrapper } from '../../PdsGoalCalculatorTestWrapper';
import { usePdsGoalAutoSave } from './usePdsGoalAutoSave';

const schema = yup.object({
  name: yup.string().required('Goal Name is required'),
  payRate: yup.number().nullable().min(0),
});

const mutationSpy = jest.fn();

const calculationMock = {
  id: 'goal-1',
  name: 'Test Goal',
  status: DesignationSupportStatus.FullTime,
  salaryOrHourly: DesignationSupportSalaryType.Salaried,
  payRate: 50000,
  hoursWorkedPerWeek: null,
  benefits: 1500,
  geographicLocation: null,
};

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PdsGoalCalculatorTestWrapper
    calculationMock={calculationMock}
    onCall={mutationSpy}
  >
    {children}
  </PdsGoalCalculatorTestWrapper>
);

describe('usePdsGoalAutoSave', () => {
  beforeEach(() => {
    mutationSpy.mockClear();
  });

  it('returns field props with value from calculation', async () => {
    const { result } = renderHook(
      () => usePdsGoalAutoSave({ fieldName: 'name', schema }),
      { wrapper: Wrapper },
    );

    await waitFor(() => expect(result.current.value).toBe('Test Goal'));
    expect(result.current.disabled).toBe(false);
  });

  it('returns disabled when no calculation exists', async () => {
    const NoCalcWrapper: React.FC<{ children: React.ReactNode }> = ({
      children,
    }) => (
      <PdsGoalCalculatorTestWrapper
        calculationMock={undefined}
        onCall={mutationSpy}
      >
        {children}
      </PdsGoalCalculatorTestWrapper>
    );

    const { result } = renderHook(
      () => usePdsGoalAutoSave({ fieldName: 'name', schema }),
      { wrapper: NoCalcWrapper },
    );

    expect(result.current.disabled).toBe(true);
  });

  it('saves value on blur when changed', async () => {
    const { result } = renderHook(
      () => usePdsGoalAutoSave({ fieldName: 'name', schema }),
      { wrapper: Wrapper },
    );

    await waitFor(() => expect(result.current.value).toBe('Test Goal'));

    act(() => {
      result.current.onChange({
        target: { value: 'Updated Goal' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    act(() => {
      result.current.onBlur();
    });

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdatePdsGoalCalculation', {
        attributes: {
          id: 'goal-1',
          name: 'Updated Goal',
        },
      }),
    );
  });

  it('does not save on blur when value is unchanged', async () => {
    const { result } = renderHook(
      () => usePdsGoalAutoSave({ fieldName: 'name', schema }),
      { wrapper: Wrapper },
    );

    await waitFor(() => expect(result.current.value).toBe('Test Goal'));

    result.current.onBlur();

    await Promise.resolve();
    await waitFor(() =>
      expect(mutationSpy).not.toHaveGraphqlOperation(
        'UpdatePdsGoalCalculation',
      ),
    );
  });

  it('returns numeric value as string', async () => {
    const { result } = renderHook(
      () => usePdsGoalAutoSave({ fieldName: 'payRate', schema }),
      { wrapper: Wrapper },
    );

    await waitFor(() => expect(result.current.value).toBe('50000'));
  });
});
