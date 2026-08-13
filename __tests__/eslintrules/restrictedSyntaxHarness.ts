// eslint-disable-next-line import/no-unresolved
import * as tsParser from '@typescript-eslint/parser';
import { Linter } from 'eslint';
import eslintConfig from '../../.eslintrc';

interface RestrictedSyntaxOption {
  selector: string;
  message: string;
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

export const lintSnippet = (code: string): LintMessage[] => {
  const messages: LintMessage[] = linter.verify(code, {
    parser,
    parserOptions,
    rules: { 'no-restricted-syntax': restrictedSyntax },
  });
  const fatal = messages.find((message) => message.fatal);
  if (fatal) {
    throw new Error(`Probe failed to parse: ${fatal.message}`);
  }

  return messages.filter(
    (message) => message.ruleId === 'no-restricted-syntax',
  );
};
