export type Params = Record<string, unknown>;

export const isPlainObject = (value: unknown): value is Params =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const hasOnlyKeys = (
  params: Params,
  allowed: readonly string[],
): boolean => Object.keys(params).every((key) => allowed.includes(key));

export const isOneOf = <T extends string>(
  value: unknown,
  allowed: readonly T[],
): value is T => typeof value === 'string' && allowed.includes(value as T);

// A set param must be a non-empty list drawn only from its closed set
export const isListOf = <T extends string>(
  value: unknown,
  allowed: readonly T[],
): value is T[] =>
  Array.isArray(value) &&
  value.length > 0 &&
  value.every((item) => isOneOf(item, allowed));
