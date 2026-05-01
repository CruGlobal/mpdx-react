import { safeProgressRatio } from './safeProgressRatio';

describe('safeProgressRatio', () => {
  it('returns the ratio when denominator is positive', () => {
    expect(safeProgressRatio(50, 100)).toBe(0.5);
  });

  it('caps the ratio at 1', () => {
    expect(safeProgressRatio(150, 100)).toBe(1);
  });

  it('returns 0 when denominator is 0', () => {
    expect(safeProgressRatio(50, 0)).toBe(0);
  });

  it('returns 0 when denominator is negative', () => {
    expect(safeProgressRatio(50, -10)).toBe(0);
  });

  it('returns 0 when both are 0', () => {
    expect(safeProgressRatio(0, 0)).toBe(0);
  });

  it('handles numerator of 0', () => {
    expect(safeProgressRatio(0, 100)).toBe(0);
  });
});
