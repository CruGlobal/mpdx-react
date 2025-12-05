import { act, renderHook } from '@testing-library/react';
import {
  FormEnum,
  PageEnum,
} from 'src/components/Reports/Shared/CalculationReports/Shared/sharedTypes';
import { useStepList } from './useStepList';

describe('useStepList', () => {
  it('returns correct steps for MHA New page', () => {
    const { result } = renderHook(() =>
      useStepList(FormEnum.MHA, PageEnum.New),
    );

    expect(result.current.steps).toEqual([
      {
        title: '1. About this Form',
        current: true,
        complete: false,
      },
      {
        title: '2. Rent or Own?',
        current: false,
        complete: false,
      },
      {
        title: '3. Calculate Your MHA',
        current: false,
        complete: false,
      },
      {
        title: '4. Receipt',
        current: false,
        complete: false,
      },
    ]);

    expect(result.current.currentIndex).toBe(0);
  });

  it('returns correct steps for MHA Edit page', () => {
    const { result } = renderHook(() =>
      useStepList(FormEnum.MHA, PageEnum.Edit),
    );

    expect(result.current.steps).toEqual([
      {
        title: '1. About this Form',
        current: true,
        complete: false,
      },
      {
        title: '2. Rent or Own?',
        current: false,
        complete: false,
      },
      {
        title: '3. Edit Your MHA',
        current: false,
        complete: false,
      },
      {
        title: '4. Receipt',
        current: false,
        complete: false,
      },
    ]);

    expect(result.current.currentIndex).toBe(0);
  });

  it('returns correct steps for Salary Calculation', () => {
    const { result } = renderHook(() => useStepList(FormEnum.SalaryCalc));

    expect(result.current.steps).toEqual([
      {
        title: '1. Effective Date',
        current: true,
        complete: false,
      },
      {
        title: '2. Your Information',
        current: false,
        complete: false,
      },
      {
        title: '3. Salary Calculation',
        current: false,
        complete: false,
      },
      {
        title: '4. Summary',
        current: false,
        complete: false,
      },
      {
        title: '5. Receipt',
        current: false,
        complete: false,
      },
    ]);

    expect(result.current.currentIndex).toBe(0);
  });

  it('returns correct steps for Additional Salary', () => {
    const { result } = renderHook(() => useStepList(FormEnum.AdditionalSalary));

    expect(result.current.steps).toEqual([
      {
        title: '1. About this Form',
        current: true,
        complete: false,
      },
      {
        title: '2. Complete Form',
        current: false,
        complete: false,
      },
      {
        title: '3. Receipt',
        current: false,
        complete: false,
      },
    ]);

    expect(result.current.currentIndex).toBe(0);
  });

  it('should handle next step and previous step correctly', () => {
    const { result } = renderHook(() =>
      useStepList(FormEnum.MHA, PageEnum.New),
    );

    expect(result.current.currentIndex).toBe(0);
    expect(result.current.percentComplete).toBe(25);

    act(() => {
      result.current.nextStep();
    });
    expect(result.current.currentIndex).toBe(1);
    expect(result.current.percentComplete).toBe(50);
    expect(result.current.steps).toEqual([
      {
        title: '1. About this Form',
        current: false,
        complete: true,
      },
      {
        title: '2. Rent or Own?',
        current: true,
        complete: false,
      },
      {
        title: '3. Calculate Your MHA',
        current: false,
        complete: false,
      },
      {
        title: '4. Receipt',
        current: false,
        complete: false,
      },
    ]);

    act(() => {
      result.current.nextStep();
    });
    expect(result.current.currentIndex).toBe(2);
    expect(result.current.percentComplete).toBe(75);
    expect(result.current.steps).toEqual([
      {
        title: '1. About this Form',
        current: false,
        complete: true,
      },
      {
        title: '2. Rent or Own?',
        current: false,
        complete: true,
      },
      {
        title: '3. Calculate Your MHA',
        current: true,
        complete: false,
      },
      {
        title: '4. Receipt',
        current: false,
        complete: false,
      },
    ]);

    act(() => {
      result.current.previousStep();
    });
    expect(result.current.currentIndex).toBe(1);
    expect(result.current.percentComplete).toBe(50);
    expect(result.current.steps).toEqual([
      {
        title: '1. About this Form',
        current: false,
        complete: true,
      },
      {
        title: '2. Rent or Own?',
        current: true,
        complete: false,
      },
      {
        title: '3. Calculate Your MHA',
        current: false,
        complete: false,
      },
      {
        title: '4. Receipt',
        current: false,
        complete: false,
      },
    ]);

    act(() => {
      result.current.previousStep();
    });
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.percentComplete).toBe(25);
    expect(result.current.steps).toEqual([
      {
        title: '1. About this Form',
        current: true,
        complete: false,
      },
      {
        title: '2. Rent or Own?',
        current: false,
        complete: false,
      },
      {
        title: '3. Calculate Your MHA',
        current: false,
        complete: false,
      },
      {
        title: '4. Receipt',
        current: false,
        complete: false,
      },
    ]);
  });
});
