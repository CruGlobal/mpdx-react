import reduceObject from './reduceObject';

const obj = {
  a: 'b',
};

describe('common.fp.reduceObject', () => {
  it('should curry', () => {
    expect(typeof reduceObject() === 'function').toEqual(true);
  });

  it('should create an object', () => {
    expect(
      reduceObject(
        (result, value, key) => {
          result[key] = value;
          return result;
        },
        {},
        obj,
      ),
    ).toEqual({ a: 'b' });
  });
});
