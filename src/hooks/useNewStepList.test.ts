import { renderHook } from '@testing-library/react';
import { PageEnum } from 'src/components/Reports/MinisterHousingAllowance/Shared/sharedTypes';
import { useNewStepList } from './useNewStepList';

describe('useNewStepList', () => {
  it('returns correct steps for New page', () => {
    const { result } = renderHook(() => useNewStepList(PageEnum.New));

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

  it('returns correct steps for Edit page', () => {
    const { result } = renderHook(() => useNewStepList(PageEnum.Edit));

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
});
