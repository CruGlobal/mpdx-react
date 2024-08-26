import { isFunction } from 'lodash/fp';
import removeObjectNulls from './removeObjectNulls';

describe('common.fp.removeObjectNulls', () => {
  it('should curry', () => {
    expect(isFunction(removeObjectNulls())).toEqual(true);
  });

  it('should remove nulls', () => {
    expect(removeObjectNulls({ a: 'b', c: null })).toEqual({ a: 'b' });
  });
});
