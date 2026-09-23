import { testContext } from './buildContext.mock';
import { buildContactHref } from './contactHref';

const contactId = '6d4e5c3b-2a19-4f8e-9d7c-1b2a3c4d5e6f';

describe('buildContactHref', () => {
  it('links to the contact when the server supplies a contact id', () => {
    expect(
      buildContactHref({ alias: 'p7', contact_id: contactId }, testContext),
    ).toBe(`/accountLists/account-list-1/contacts/${contactId}`);
  });

  it('returns null for an alias alone because Tier 1 cannot resolve it', () => {
    expect(buildContactHref({ alias: 'p7' }, testContext)).toBeNull();
  });

  it.each([
    ['a malformed alias', { alias: 'P-7', contact_id: contactId }],
    ['a missing alias', { contact_id: contactId }],
    ['a contact id that is not a uuid', { alias: 'p7', contact_id: '../x' }],
    ['an unknown param', { alias: 'p7', contact_id: contactId, tab: 'x' }],
  ])('returns null for %s', (_, params) => {
    expect(buildContactHref(params, testContext)).toBeNull();
  });
});
