import { type GraphqlOperationMatcher } from './extensions/toHaveGraphqlOperation';

declare global {
  namespace jest {
    interface Matchers {
      toHaveGraphqlOperation: (
        operationName: string,
        variables?: Record<string, unknown>,
      ) => jest.CustomMatcherResult;
    }

    interface ExpectExtendMap {
      toHaveGraphqlOperation: GraphqlOperationMatcher;
    }
  }
}
