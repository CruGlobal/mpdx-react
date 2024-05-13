export const extractCookie = (cookies: string | undefined, cookieName) => {
  if (!cookies) {
    return undefined;
  }
  return cookies?.split(`${cookieName}=`)[1]?.split(';')[0];
};
