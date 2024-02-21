// This file needs a dummy import to fix TS error 1208: "file" cannot be compiled under '--isolatedModules' because it is considered a global script file.
import _ from 'jest';

describe('toHaveGraphqlOperation', () => {
  it('finds operations without variables', () => {
    const mutationSpy = jest.fn();
    mutationSpy({
      operation: {
        operationName: 'Operation',
        variables: { field1: 1, field2: 'a' },
      },
    });
    mutationSpy({
      operation: {
        operationName: 'Operation2',
        variables: { field1: 1, field2: 'a' },
      },
    });

    expect(mutationSpy).toHaveGraphqlOperation('Operation');
    expect(mutationSpy).not.toHaveGraphqlOperation('Operation3');
  });

  it('finds operations with variables', () => {
    const mutationSpy = jest.fn();
    mutationSpy({
      operation: {
        operationName: 'Operation',
        variables: { field1: 1, field2: 'a' },
      },
    });
    mutationSpy({
      operation: {
        operationName: 'Operation2',
        variables: { field1: 1, field2: 'a' },
      },
    });

    expect(mutationSpy).toHaveGraphqlOperation('Operation', { field1: 1 });
    expect(mutationSpy).not.toHaveGraphqlOperation('Operation2', { field1: 2 });
  });
});
