import { getRequestUrl } from './getRequestUrl';

const accountListId = '123';
const requestId = '456';

describe('getRequestUrl', () => {
  it('returns correct url with edit param', () => {
    expect(getRequestUrl(accountListId, requestId, 'edit')).toBe(
      '/accountLists/123/reports/additionalSalaryRequest/456?mode=edit',
    );
  });
  it('returns correct url with view param', () => {
    expect(getRequestUrl(accountListId, requestId, 'view')).toBe(
      '/accountLists/123/reports/additionalSalaryRequest/456?mode=view',
    );
  });
  it('returns correct url with new param', () => {
    expect(getRequestUrl(accountListId, requestId, 'new')).toBe(
      '/accountLists/123/reports/additionalSalaryRequest/456?mode=new',
    );
  });
});
