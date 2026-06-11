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

      /**
       * Asserts that a table contains exactly the provided column headers,
       * row headers, and cells. Omitted properties are not checked. Cell
       * contents may be strings or asymmetric matchers like `expect.stringContaining(...)`.
       *
       * Nested arrays are flattened before comparison, so grouping cells into
       * rows is for readability only. Contents are compared as one flat list
       * in DOM order, and row boundaries are NOT verified.
       *
       * @example
       * expect(getByRole('table')).toHaveTableStructure({
       *   columnHeaders: ['Category', 'John'],
       *   rowHeaders: ['Salary', 'MHA'],
       *   cells: [
       *     ['$10,001.00', '$20,001.00'],
       *     ['$10,002.00', '$20,002.00'],
       *   ],
       * });
       */
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
