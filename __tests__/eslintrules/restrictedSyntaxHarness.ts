// eslint-disable-next-line import/no-unresolved
import * as tsParser from '@typescript-eslint/parser';
import { Linter } from 'eslint';
import eslintConfig from '../../.eslintrc';

interface RestrictedSyntaxOption {
  selector: string;
  message: string;
}

interface RestrictedImportsOption {
  patterns: { group: string[]; message: string }[];
}

export interface LintMessage {
  ruleId: string | null;
  message: string;
  severity: number;
  fatal?: boolean;
}

const parser = '@typescript-eslint/parser';
const parserOptions = {
  ecmaVersion: 2020,
  sourceType: 'module',
  ecmaFeatures: { jsx: true },
};
const linter = new Linter();
linter.defineParser(parser, tsParser);

// Assert against the real rules
export const restrictedSyntax = eslintConfig.rules['no-restricted-syntax'] as [
  'error',
  ...RestrictedSyntaxOption[],
];
const [_, ...options] = restrictedSyntax;

export const ruleFor = (selectorFragment: string): RestrictedSyntaxOption => {
  const option = options.find(({ selector }) =>
    selector.includes(selectorFragment),
  );
  if (!option) {
    throw new Error(
      `No no-restricted-syntax rule has a selector containing "${selectorFragment}"`,
    );
  }
  return option;
};

// Assert against the real rule
export const restrictedImports = eslintConfig.rules[
  'no-restricted-imports'
] as ['error', RestrictedImportsOption];
const [, { patterns }] = restrictedImports;

export const importRuleFor = (
  groupFragment: string,
): RestrictedImportsOption['patterns'][number] => {
  const pattern = patterns.find(({ group }) =>
    group.some((glob) => glob.includes(groupFragment)),
  );
  if (!pattern) {
    throw new Error(
      `No no-restricted-imports rule has a group containing "${groupFragment}"`,
    );
  }
  return pattern;
};

const lintWith = (
  code: string,
  ruleId: string,
  ruleConfig: Linter.RuleEntry,
): LintMessage[] => {
  const messages: LintMessage[] = linter.verify(code, {
    parser,
    parserOptions,
    rules: { [ruleId]: ruleConfig },
  });
  const fatal = messages.find((message) => message.fatal);
  if (fatal) {
    throw new Error(`Probe failed to parse: ${fatal.message}`);
  }

  return messages.filter((message) => message.ruleId === ruleId);
};

export const lintSnippet = (code: string): LintMessage[] =>
  lintWith(code, 'no-restricted-syntax', restrictedSyntax);

export const lintImportSnippet = (code: string): LintMessage[] =>
  lintWith(code, 'no-restricted-imports', restrictedImports);
