import { ParsedUrlQuery } from 'querystring';

// Return the value of a query param as a string or undefined
export const getQueryParam = (
  query: ParsedUrlQuery,
  param: string,
): string | undefined => {
  const value = query[param];
  if (typeof value === 'undefined') {
    return undefined;
  } else if (typeof value === 'string') {
    return value;
  } else {
    return value[0];
  }
};
