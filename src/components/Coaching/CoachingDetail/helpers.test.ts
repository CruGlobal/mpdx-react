import { getLastNewsletter, getResultColor } from './helpers';

describe('getLastNewsletter', () => {
  it('returns the latest date when two dates are provided', () => {
    expect(
      getLastNewsletter('2023-01-01T00:00:00Z', '2023-01-02T00:00:00Z'),
    ).toBe('2023-01-02T00:00:00Z');
  });

  it('returns the other date when one is missing', () => {
    expect(getLastNewsletter('2023-01-01T00:00:00Z', null)).toBe(
      '2023-01-01T00:00:00Z',
    );
    expect(getLastNewsletter(null, '2023-01-01T00:00:00Z')).toBe(
      '2023-01-01T00:00:00Z',
    );
  });

  it('returns null when both dates are missing', () => {
    expect(getLastNewsletter(null, null)).toBeNull();
  });
});

describe('getResultColor', () => {
  it('is green when at or above the goal', () => {
    expect(getResultColor(10, 10)).toBe('#5CB85C');
    expect(getResultColor(11, 10)).toBe('#5CB85C');
  });

  it('is yellow when at or above 80% of the goal', () => {
    expect(getResultColor(8, 10)).toBe('#8A6D3B');
    expect(getResultColor(9, 10)).toBe('#8A6D3B');
  });

  it('is red when below 80% of the goal', () => {
    expect(getResultColor(7, 10)).toBe('#A94442');
  });
});
