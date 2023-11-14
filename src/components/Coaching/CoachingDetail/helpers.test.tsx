import { getLastNewsletter } from './helpers';

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
