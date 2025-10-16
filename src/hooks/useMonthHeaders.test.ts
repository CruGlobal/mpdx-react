import { renderHook } from '@testing-library/react';
import theme from 'src/theme';
import { useMonthHeaders } from './useMonthHeaders';

const months = [
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
];

const colors = {
  first: theme.palette.primary.main,
  second: theme.palette.chartOrange.main,
};

describe('useMonthHeaders', () => {
  it('should return the correct month count', () => {
    const { result } = renderHook(() => useMonthHeaders(months, colors));

    expect(result.current.monthCount).toEqual([
      { year: '2024', count: 8 },
      { year: '2025', count: 4 },
    ]);
  });

  it('should return the correct first month flags', () => {
    const { result } = renderHook(() => useMonthHeaders(months, colors));

    expect(result.current.firstMonthFlags).toEqual([
      { year: '2024', isFirstOfYear: true },
      { year: '2024', isFirstOfYear: false },
      { year: '2024', isFirstOfYear: false },
      { year: '2024', isFirstOfYear: false },
      { year: '2024', isFirstOfYear: false },
      { year: '2024', isFirstOfYear: false },
      { year: '2024', isFirstOfYear: false },
      { year: '2024', isFirstOfYear: false },
      { year: '2025', isFirstOfYear: true },
      { year: '2025', isFirstOfYear: false },
      { year: '2025', isFirstOfYear: false },
      { year: '2025', isFirstOfYear: false },
    ]);
  });

  it('should return the correct border colors', () => {
    const { result } = renderHook(() => useMonthHeaders(months, colors));

    expect(result.current.getBorderColor(0)).toBe(colors.first);
    expect(result.current.getBorderColor(1)).toBe(colors.second);
  });
});
