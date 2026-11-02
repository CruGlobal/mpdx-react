import { isGraphQLErrorSuppressed } from './suppressErrors';

const guard = { extensions: { code: 'FILTER_REQUIRED' } };
const notFound = { extensions: { code: 'NOT_FOUND' } };
const uncoded = { extensions: undefined };

describe('isGraphQLErrorSuppressed', () => {
  it('suppresses nothing by default', () => {
    expect(isGraphQLErrorSuppressed({}, guard)).toBe(false);
    expect(isGraphQLErrorSuppressed({}, uncoded)).toBe(false);
  });

  it('suppresses every error when suppressErrors is set', () => {
    expect(isGraphQLErrorSuppressed({ suppressErrors: true }, guard)).toBe(
      true,
    );
    expect(isGraphQLErrorSuppressed({ suppressErrors: true }, uncoded)).toBe(
      true,
    );
  });

  it('suppresses only the listed codes when suppressErrorCodes is set', () => {
    const context = { suppressErrorCodes: ['FILTER_REQUIRED'] };
    expect(isGraphQLErrorSuppressed(context, guard)).toBe(true);
    expect(isGraphQLErrorSuppressed(context, notFound)).toBe(false);
    expect(isGraphQLErrorSuppressed(context, uncoded)).toBe(false);
  });

  it('ignores a non-string code', () => {
    expect(
      isGraphQLErrorSuppressed(
        { suppressErrorCodes: ['1'] },
        { extensions: { code: 1 } },
      ),
    ).toBe(false);
  });
});
