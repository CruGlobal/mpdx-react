import { Operation } from '@apollo/client';
import { ExecutionResult } from 'graphql';
import { recursiveObjectContaining } from './recursiveObjectContaining';

export type GraphqlOperationMatcher = (
  this: jest.MatcherContext,
  received: jest.Mock<
    void,
    [{ operation: Operation; response: ExecutionResult }]
  >,
  operationName: string,
  variables?: Record<string, unknown>,
) => jest.CustomMatcherResult;

export const toHaveGraphqlOperation: GraphqlOperationMatcher = function (
  received,
  operationName,
  variables,
) {
  const operations = received.mock.calls.map(([{ operation }]) => operation);
  const pass = operations.some((operation) =>
    this.equals(
      operation,
      recursiveObjectContaining({
        operationName,
        variables: variables ?? {},
      }),
    ),
  );

  return {
    pass,
    message: () =>
      `Expected ${
        pass ? 'not to receive' : 'to receive'
      } GraphQL operation ${this.utils.printExpected(operationName)}${
        variables
          ? ' with variables ' + this.utils.printExpected(variables)
          : ''
      }\n` +
      `Received the following ${operations.length} GraphQL operations:` +
      operations
        .map(
          ({ operationName, variables }) =>
            `\n  ${this.utils.printReceived(
              operationName,
            )} with variables ${this.utils.printReceived(variables)}`,
        )
        .join(''),
  };
};
