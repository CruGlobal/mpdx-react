import { type GraphqlOperationMatcher } from './extensions/toHaveGraphqlOperation';
import {
  type ExpectedTableStructure,
  type TableStructureMatcher,
} from './extensions/toHaveTableStructure';

declare global {
  namespace jest {
    interface Matchers {
      toHaveGraphqlOperation: (
        operationName: string,
        variables?: Record<string, unknown>,
      ) => jest.CustomMatcherResult;

      toHaveTableStructure: (
        structure: ExpectedTableStructure,
      ) => jest.CustomMatcherResult;
    }

    interface ExpectExtendMap {
      toHaveGraphqlOperation: GraphqlOperationMatcher;
      toHaveTableStructure: TableStructureMatcher;
    }
  }
}
