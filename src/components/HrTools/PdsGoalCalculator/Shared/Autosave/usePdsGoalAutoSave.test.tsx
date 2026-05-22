import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import * as yup from 'yup';
import {
  DesignationSupportSalaryType,
  DesignationSupportStatus,
} from 'src/graphql/types.generated';
import { PdsGoalCalculatorTestWrapper } from '../../PdsGoalCalculatorTestWrapper';
import { usePdsGoalAutoSave } from './usePdsGoalAutoSave';
import { useSaveField } from './useSaveField';

const schema = yup.object({
  name: yup.string().required('Goal Name is required'),
  payRate: yup.number().nullable().min(0),
  formType: yup.string().nullable(),
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

    expect(mutationSpy).not.toHaveGraphqlOperation('UpdatePdsGoalCalculation');
  });

  it('returns numeric value as string', async () => {
    const { result } = renderHook(
      () => usePdsGoalAutoSave({ fieldName: 'payRate', schema }),
      { wrapper: Wrapper },
    );

    await waitFor(() => expect(result.current.value).toBe('50000'));
  });

  it('disables saveOnChange fields while a save is in flight', async () => {
    const { result } = renderHook(
      () =>
        usePdsGoalAutoSave({
          fieldName: 'formType',
          schema,
          saveOnChange: true,
        }),
      { wrapper: Wrapper },
    );

    await waitFor(() => expect(result.current.disabled).toBe(false));

    act(() => {
      result.current.onChange({
        target: { value: 'simple' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.disabled).toBe(true);
    await waitFor(() => expect(result.current.disabled).toBe(false));
  });

  it('disables blur-driven fields while a save for the same field is in flight', async () => {
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

    expect(result.current.disabled).toBe(true);
    await waitFor(() => expect(result.current.disabled).toBe(false));
  });

  it('exposes busy=true only while a same-field save is in flight', async () => {
    const { result } = renderHook(
      () => usePdsGoalAutoSave({ fieldName: 'name', schema }),
      { wrapper: Wrapper },
    );

    await waitFor(() => expect(result.current.value).toBe('Test Goal'));
    expect(result.current.busy).toBe(false);

    act(() => {
      result.current.onChange({
        target: { value: 'Updated Goal' },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    act(() => {
      result.current.onBlur();
    });

    expect(result.current.busy).toBe(true);
    await waitFor(() => expect(result.current.busy).toBe(false));
  });

  it('reports busy=false when disabled solely because calculation is missing', () => {
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
    expect(result.current.busy).toBe(false);
  });

  it('does not disable a saveOnChange field while an unrelated field is saving', async () => {
    const { result } = renderHook(
      () => ({
        formType: usePdsGoalAutoSave({
          fieldName: 'formType',
          schema,
          saveOnChange: true,
        }),
        name: usePdsGoalAutoSave({ fieldName: 'name', schema }),
      }),
      { wrapper: Wrapper },
    );

    await waitFor(() => expect(result.current.name.value).toBe('Test Goal'));
    expect(result.current.formType.disabled).toBe(false);

    act(() => {
      result.current.name.onChange({
        target: { value: 'Updated Goal' },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    act(() => {
      result.current.name.onBlur();
    });

    expect(result.current.formType.disabled).toBe(false);

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdatePdsGoalCalculation'),
    );
    expect(result.current.formType.disabled).toBe(false);
  });

  it('locks the Pay Rate input while a multi-field save covering payRate is in flight', async () => {
    const { result } = renderHook(
      () => ({
        payRate: usePdsGoalAutoSave({ fieldName: 'payRate', schema }),
        saveField: useSaveField(),
      }),
      { wrapper: Wrapper },
    );

    await waitFor(() => expect(result.current.payRate.value).toBe('50000'));
    expect(result.current.payRate.disabled).toBe(false);

    act(() => {
      result.current.saveField({
        salaryOrHourly: DesignationSupportSalaryType.Hourly,
        payRate: null,
      });
    });

    expect(result.current.payRate.disabled).toBe(true);
    await waitFor(() => expect(result.current.payRate.disabled).toBe(false));
  });
});
