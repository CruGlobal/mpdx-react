import { GraphQLError } from 'graphql';

/*
 * Given a GraphQL error, return true if the error was caused by an account list
 * could not be found, an false otherwise.
 */
export const isAccountListNotFoundError = (error: GraphQLError): boolean => {
  const { message, extensions } = error;
  return (
    extensions.code === 'NOT_FOUND' &&
    (message.includes('AccountList') ||
      message.includes("Resource 'AccountList'"))
  );
};

/*
 * Given a URL to a page that contains an invalid account list id, replace the
 * account list id with the defaultAccountList.
 */
export const replaceUrlAccountList = (
  url: string,
  defaultAccountList: string | null | undefined,
): string => {
  if (defaultAccountList && url.startsWith('/accountLists/')) {
    const parts = url.split('/');
    parts[2] = defaultAccountList;
    return parts.join('/');
  } else {
    return '/accountLists';
  }
};
