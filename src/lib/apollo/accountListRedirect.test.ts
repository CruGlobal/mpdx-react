import { GraphQLError } from 'graphql';
import {
  isAccountListNotFoundError,
  replaceUrlAccountList,
} from './accountListRedirect';

describe('isAccountListNotFoundError', () => {
  const makeError = (message: string, code: string): GraphQLError =>
    new GraphQLError(message, { extensions: { code } });

  it('returns false for errors besides NOT_FOUND', () => {
    expect(
      isAccountListNotFoundError(
        makeError('Internal Server Error', 'INTERNAL_SERVER_ERROR'),
      ),
    ).toBe(false);
  });

  it('returns false for not found errors besides account lists', () => {
    expect(
      isAccountListNotFoundError(makeError('Contact not found', 'NOT_FOUND')),
    ).toBe(false);
  });

  it('returns true for not found errors from the Rails API', () => {
    expect(
      isAccountListNotFoundError(
        makeError('AccountList not found', 'NOT_FOUND'),
      ),
    ).toBe(true);
  });

  it('returns true for not found errors from the proxy API', () => {
    expect(
      isAccountListNotFoundError(
        makeError("Resource 'AccountList' not found", 'NOT_FOUND'),
      ),
    ).toBe(true);
  });
});

describe('replaceUrlAccountList', () => {
  it('returns to default url if url is invalid', () => {
    expect(replaceUrlAccountList('/', '12345')).toBe('/accountLists');
    expect(replaceUrlAccountList('/invalid_url/', '12345')).toBe(
      '/accountLists',
    );
    expect(replaceUrlAccountList('https://google.com/', '12345')).toBe(
      '/accountLists',
    );
  });

  it('returns to default url if defaultAccountListId is invalid', () => {
    expect(replaceUrlAccountList('/accountLists/', null)).toBe('/accountLists');
  });

  it('replaces the accountListId in the url with the default accountListId', () => {
    //redirect keeps current page it is on
    expect(
      replaceUrlAccountList(
        '/accountLists/invalid-account-list/contacts',
        '12345',
      ),
    ).toBe('/accountLists/12345/contacts');
  });
});
