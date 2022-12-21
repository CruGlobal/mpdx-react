import { getQueryParam } from './queryParam';

describe('getRouterQueryParam', () => {
  it('returns undefined when param is undefined', () => {
    const query = { key: undefined };
    expect(getQueryParam(query, 'key')).toBeUndefined();
  });

  it('returns string when param is a string', () => {
    const query = { key: 'value' };
    expect(getQueryParam(query, 'key')).toBe('value');
  });

  it('returns the first value when params is an array', () => {
    const query = { key: ['value1', 'value2'] };
    expect(getQueryParam(query, 'key')).toBe('value1');
  });
});
