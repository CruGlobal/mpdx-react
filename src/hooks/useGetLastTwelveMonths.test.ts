import { renderHook } from '@testing-library/react';
import { DateTime } from 'luxon';
import { useGetLastTwelveMonths } from './useGetLastTwelveMonths';

const currency = 'en-US';
const endDate: DateTime = DateTime.local(2025, 4, 1);

describe('useGetLastTwelveMonths', () => {
  it('should return the last twelve months', () => {
    const { result } = renderHook(() =>
      useGetLastTwelveMonths(currency, endDate),
    );

    expect(result.current).toEqual([
      'May 2024',
      'Jun 2024',
      'Jul 2024',
      'Aug 2024',
      'Sep 2024',
      'Oct 2024',
      'Nov 2024',
      'Dec 2024',
      'Jan 2025',
      'Feb 2025',
      'Mar 2025',
      'Apr 2025',
    ]);
  });

  it('should return January–December of a specific year when one is given', () => {
    const { result } = renderHook(() =>
      useGetLastTwelveMonths(currency, endDate, 2023),
    );

    expect(result.current).toEqual([
      'Jan 2023',
      'Feb 2023',
      'Mar 2023',
      'Apr 2023',
      'May 2023',
      'Jun 2023',
      'Jul 2023',
      'Aug 2023',
      'Sep 2023',
      'Oct 2023',
      'Nov 2023',
      'Dec 2023',
    ]);
  });
});
