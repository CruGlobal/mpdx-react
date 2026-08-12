import { renderHook } from '@testing-library/react-hooks';
import { useFormatters } from './useFormatters';

const {
  result: { current: formatters },
} = renderHook(() => useFormatters());

describe('useFormatters', () => {
  it('formatCurrency formats as USD, treating null/undefined as zero', () => {
    expect(formatters.formatCurrency(1234.5)).toBe('$1,234.50');
    expect(formatters.formatCurrency(null)).toBe('$0.00');
    expect(formatters.formatCurrency(undefined)).toBe('$0.00');
  });

  it('formatFraction defaults to two fraction digits and honors an override', () => {
    expect(formatters.formatFraction(0.8)).toBe('80.00%');
    expect(formatters.formatFraction(0.8, 0)).toBe('80%');
    expect(formatters.formatFraction(null, 0)).toBe('0%');
  });

  it('formatPercentage divides by 100, defaults to two fraction digits, and honors an override', () => {
    expect(formatters.formatPercentage(80)).toBe('80.00%');
    expect(formatters.formatPercentage(80.55, 1)).toBe('80.6%');
    expect(formatters.formatPercentage(undefined)).toBe('0.00%');
  });

  it('formatDecimal formats with two to four fraction digits, treating null/undefined as zero', () => {
    expect(formatters.formatDecimal(1234.56789)).toBe('1,234.5679');
    expect(formatters.formatDecimal(null)).toBe('0.00');
  });
});
