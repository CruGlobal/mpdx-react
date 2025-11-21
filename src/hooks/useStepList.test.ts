import { renderHook } from '@testing-library/react';
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

    expect(result.current).toEqual([
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

  it('returns correct steps for MHA Edit page', () => {
    const { result } = renderHook(() =>
      useStepList(FormEnum.MHA, PageEnum.Edit),
    );

    expect(result.current).toEqual([
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
  });

  it('returns correct steps for Salary Calculation', () => {
    const { result } = renderHook(() => useStepList(FormEnum.SalaryCalc));

    expect(result.current).toEqual([
      {
        title: '1. Effective Date',
        current: true,
        complete: false,
      },
      {
        title: '2. Personal Information',
        current: false,
        complete: false,
      },
      {
        title: '3. MHA Request',
        current: false,
        complete: false,
      },
      {
        title: '4. 403(b) Contribution',
        current: false,
        complete: false,
      },
      {
        title: '5. Max Allowable Salary',
        current: false,
        complete: false,
      },
      {
        title: '6. Requested Salary',
        current: false,
        complete: false,
      },
      {
        title: '7. Summary',
        current: false,
        complete: false,
      },
      {
        title: '7b. Additional Information',
        current: true,
        complete: false,
      },
      {
        title: '8. Receipt',
        current: false,
        complete: false,
      },
    ]);
  });

  it('returns correct steps for Additional Salary', () => {
    const { result } = renderHook(() => useStepList(FormEnum.AdditionalSalary));

    expect(result.current).toEqual([
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
  });
});
