import { GraphQLFormattedError } from 'graphql';

/**
 * Per-operation opt-outs from the global error link's toast and error report,
 * set through Apollo's operation `context`.
 *
 * Prefer `suppressErrorCodes`: it silences only the named
 * `extensions.code` values (for example an API guard the component renders
 * itself as guidance) while every other failure still toasts and reaches
 * monitoring. `suppressErrors` silences everything on the operation and should
 * only be used when the component renders every error itself.
 */
export interface SuppressErrorsContext {
  suppressErrors?: boolean;
  suppressErrorCodes?: string[];
}

export const isGraphQLErrorSuppressed = (
  context: SuppressErrorsContext,
  error: Pick<GraphQLFormattedError, 'extensions'>,
): boolean => {
  if (context.suppressErrors === true) {
    return true;
  }
  const code = error.extensions?.code;
  return (
    typeof code === 'string' &&
    (context.suppressErrorCodes ?? []).includes(code)
  );
};
