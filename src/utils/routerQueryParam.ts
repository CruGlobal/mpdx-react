import { NextRouter } from 'next/router';

// Return the value of a router query param
export const getRouterQueryParam = (
  router: NextRouter,
  param: string,
): string | undefined => {
  const value = router.query[param];
  if (typeof value === 'undefined') {
    return undefined;
  } else if (typeof value === 'string') {
    return value;
  } else {
    return value[0];
  }
};
