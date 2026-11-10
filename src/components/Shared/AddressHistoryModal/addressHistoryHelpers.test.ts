import i18n from 'src/lib/i18n';
import {
  AddressAuthor,
  formatAddress,
  formatChangeMadeBy,
  isAutomaticChange,
} from './addressHistoryHelpers';

const currentUserId = 'user-1';

const addressChange = (overrides: Partial<AddressAuthor>): AddressAuthor => ({
  source: 'Siebel',
  createdByUser: null,
  ...overrides,
});

describe('formatAddress', () => {
  it('joins the street, city, state, and postal code', () => {
    expect(
      formatAddress({
        street: '2125 6th Ave W',
        city: 'Seattle',
        state: 'WA',
        postalCode: '98119',
      }),
    ).toBe('2125 6th Ave W, Seattle, WA 98119');
  });

  it('puts multi-line streets on one line', () => {
    expect(
      formatAddress({
        street: 'Apt 4\n12 Elm Rd',
        city: 'Burnaby',
        state: 'BC',
        postalCode: 'V5H 1A1',
      }),
    ).toBe('Apt 4, 12 Elm Rd, Burnaby, BC V5H 1A1');
  });

  it('skips missing parts', () => {
    expect(
      formatAddress({
        street: '456 Main St',
        city: null,
        state: null,
        postalCode: '62701',
      }),
    ).toBe('456 Main St, 62701');
  });
});

describe('isAutomaticChange', () => {
  it('treats MPDX changes as manual', () => {
    expect(isAutomaticChange('MPDX')).toBe(false);
  });

  it.each(['Siebel', 'US', 'US Donation System', 'DataServer'])(
    'treats %s changes as automatic',
    (source) => {
      expect(isAutomaticChange(source)).toBe(true);
    },
  );
});

describe('formatChangeMadeBy', () => {
  it.each([
    ['Siebel', 'Automatic update from US Donation Services'],
    ['US', 'Automatic update from US Donation Services'],
    ['US Donation System', 'Automatic update from US Donation Services'],
    ['DataServer', 'Automatic update from DonorHub'],
  ])('labels %s changes as "%s"', (source, label) => {
    expect(
      formatChangeMadeBy(addressChange({ source }), currentUserId, i18n.t),
    ).toBe(label);
  });

  it('labels the current user as "You"', () => {
    expect(
      formatChangeMadeBy(
        addressChange({
          source: 'MPDX',
          createdByUser: {
            id: currentUserId,
            firstName: 'Test',
            lastName: 'User',
          },
        }),
        currentUserId,
        i18n.t,
      ),
    ).toBe('You, in MPDX');
  });

  it('labels other users by name', () => {
    expect(
      formatChangeMadeBy(
        addressChange({
          source: 'MPDX',
          createdByUser: { id: 'user-2', firstName: 'Jane', lastName: 'Smith' },
        }),
        currentUserId,
        i18n.t,
      ),
    ).toBe('Jane Smith, in MPDX');
  });

  it('names only the app when no user was recorded', () => {
    expect(
      formatChangeMadeBy(
        addressChange({ source: 'MPDX' }),
        currentUserId,
        i18n.t,
      ),
    ).toBe('In MPDX');
  });
});
