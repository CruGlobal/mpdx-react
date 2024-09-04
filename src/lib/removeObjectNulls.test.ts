import removeObjectNulls from './removeObjectNulls';

describe('common.fp.removeObjectNulls', () => {
  it('should return empty object', () => {
    expect(removeObjectNulls({})).toEqual({});
  });

  it('should remove nulls', () => {
    expect(removeObjectNulls({ a: 'b', c: null })).toEqual({ a: 'b' });
  });
});
