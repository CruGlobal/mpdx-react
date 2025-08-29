import { renderHook } from '@testing-library/react';
import { DateTime } from 'luxon';
import { useGetLastTwelveMonths } from './useGetLastTwelveMonths';

const currency = 'en-US';
const fixed: DateTime = DateTime.local(2025, 4, 1);
jest.spyOn(DateTime, 'now').mockReturnValue(fixed);

describe('useGetLastTwelveMonths', () => {
  it('should return the last twelve months', () => {
    const { result } = renderHook(() => useGetLastTwelveMonths(currency, true));

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
});
