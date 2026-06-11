import { within } from '@testing-library/dom';

interface AsymmetricMatcher {
  asymmetricMatch: (actual: unknown) => boolean;
}

type ExpectedContent = string | AsymmetricMatcher;

export interface ExpectedTableStructure {
  cells?: Array<ExpectedContent | ExpectedContent[]>;
  columnHeaders?: Array<ExpectedContent | ExpectedContent[]>;
  rowHeaders?: Array<ExpectedContent | ExpectedContent[]>;
}

export type TableStructureMatcher = (
  this: jest.MatcherContext,
  received: HTMLElement,
  expected: ExpectedTableStructure,
) => jest.CustomMatcherResult;

const structureRoles = [
  ['cells', 'cell'],
  ['columnHeaders', 'columnheader'],
  ['rowHeaders', 'rowheader'],
] as const;

export const toHaveTableStructure: TableStructureMatcher = function (
  received,
  expected,
) {
  if (!expected.cells && !expected.columnHeaders && !expected.rowHeaders) {
    throw new Error(
      'toHaveTableStructure requires at least one of cells, columnHeaders, or rowHeaders',
    );
  }

  const mismatches: string[] = [];
  structureRoles.forEach(([property, role]) => {
    const expectedContents = expected[property];
    if (!expectedContents) {
      return;
    }

    // Nested arrays are flattened, so row grouping is for readability only.
    // Contents are compared as one flat list in DOM order, and row boundaries
    // are not verified.
    const expectedFlattened = expectedContents.flat();
    const actualContents = within(received)
      .queryAllByRole(role)
      .map((element) => element.textContent);
    if (!this.equals(actualContents, expectedFlattened)) {
      mismatches.push(
        `${property}:\n${this.utils.printDiffOrStringify(
          expectedFlattened,
          actualContents,
          `Expected ${property}`,
          `Received ${property}`,
          this.expand !== false,
        )}`,
      );
    }
  });

  return {
    pass: mismatches.length === 0,
    message: () =>
      mismatches.length
        ? `Expected table to match the expected structure\n\n${mismatches.join(
            '\n\n',
          )}`
        : 'Expected table not to match the expected structure',
  };
};
