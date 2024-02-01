import { recursiveObjectContaining } from './recursiveObjectContaining';

describe('recursiveObjectContaining', () => {
  it('handles simple complete match', () => {
    expect({
      field1: 'a',
      field2: 'b',
    }).toEqual(
      recursiveObjectContaining({
        field1: 'a',
        field2: 'b',
      }),
    );
  });

  it('handles simple partial match', () => {
    expect({
      field1: 'a',
      field2: 'b',
      field3: 'c',
    }).toEqual(
      recursiveObjectContaining({
        field1: 'a',
        field2: 'b',
      }),
    );
  });

  it('handles empty object', () => {
    expect({
      field1: 'a',
      field2: 'b',
      field3: 'c',
    }).toEqual(recursiveObjectContaining({}));
  });

  it('handles nested objects', () => {
    expect({
      nested: {
        field1: 'a',
        nested: {
          field2: 'b',
          nested: {
            field3: 'c',
          },
        },
      },
    }).toEqual(
      recursiveObjectContaining({
        nested: {
          nested: {
            nested: {
              field3: 'c',
            },
          },
        },
      }),
    );
  });

  it('handles non-matching objects', () => {
    expect({
      nested: {
        field1: 'a',
        nested: {
          field2: 'b',
          nested: {
            field3: 'c',
          },
        },
      },
    }).not.toEqual(
      recursiveObjectContaining({
        nested: {
          field1: 'a',
          nested: {
            field2: 'b',
            nested: {
              field3: 'd',
            },
          },
        },
      }),
    );
  });

  it('handles simple arrays', () => {
    expect(['a', 'b', 'c']).toEqual(recursiveObjectContaining(['a', 'b', 'c']));
  });

  it('handles complex arrays', () => {
    expect([{ field: 'a' }, 'b', { field: 'c' }]).toEqual(
      recursiveObjectContaining([{ field: 'a' }, 'b', {}]),
    );
  });

  it('handles non-matching arrays', () => {
    expect([{ field: 'a' }, 'b', { field: 'c' }]).not.toEqual(
      recursiveObjectContaining([{ field: 'a' }, 'd', {}]),
    );
  });
});
