import { computeThresholds, percentile } from './stats';

describe('percentile', () => {
  it('returns 0 for an empty series', () => {
    expect(percentile([], 99)).toBe(0);
  });

  it('interpolates linearly', () => {
    expect(percentile([1, 2, 3, 4], 50)).toBe(2.5);
    expect(percentile([1, 2, 3, 4], 100)).toBe(4);
    expect(percentile([1, 2, 3, 4], 0)).toBe(1);
  });

  it('is order-independent', () => {
    expect(percentile([4, 1, 3, 2], 50)).toBe(2.5);
  });
});

describe('computeThresholds', () => {
  it('scales the p99 by the multiplier', () => {
    const series = Array.from({ length: 100 }, (_, index) => index + 1);
    const { critical } = computeThresholds(series, {
      multiplier: 1.5,
      minCritical: 1,
      maxCritical: 200,
    });
    expect(critical).toBe(149);
  });

  it('applies the minimum floor on sparse data', () => {
    expect(
      computeThresholds([0, 0, 1], {
        multiplier: 2,
        minCritical: 15,
        maxCritical: 60,
      }),
    ).toEqual({ warning: 9, critical: 15 });
  });

  it('keeps warning below critical', () => {
    const { warning, critical } = computeThresholds([5, 5, 5, 5], {
      multiplier: 1,
      minCritical: 5,
      maxCritical: 12,
    });
    expect(warning).toBeLessThan(critical);
  });

  it('throws on an empty series instead of returning the floor', () => {
    expect(() =>
      computeThresholds([], {
        multiplier: 2,
        minCritical: 15,
        maxCritical: 60,
      }),
    ).toThrow('nothing to calibrate from');
  });

  it('throws instead of blessing a critical above maxCritical', () => {
    const series = Array.from({ length: 100 }, (_, index) => index + 1);
    expect(() =>
      computeThresholds(series, {
        multiplier: 1.5,
        minCritical: 1,
        maxCritical: 100,
      }),
    ).toThrow('critical 149 exceeds maxCritical 100');
  });
});
