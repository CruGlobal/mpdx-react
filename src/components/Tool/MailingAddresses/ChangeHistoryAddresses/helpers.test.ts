import { DateTime, Settings } from 'luxon';
import { AddressChangeMadeByEnum } from 'src/graphql/types.generated';
import i18n from 'src/lib/i18n';
import {
  mockAddressChangeHistory,
  mockAddressChanges,
} from './ChangeHistoryAddressesMock';
import {
  AddressChangeRow,
  ContactFilterChangedDuringEnum,
  formatAddress,
  formatChangeMadeBy,
  formatMadeByOption,
  getChangedDuringRange,
  groupMadeByOptions,
  isAutomaticChange,
} from './helpers';

const currentUserId = 'user-1';

const addressChange = (
  overrides: Partial<AddressChangeRow>,
): AddressChangeRow => ({
  ...mockAddressChanges[0],
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

  it.each(['Siebel', 'US Donation System', 'DataServer'])(
    'treats %s changes as automatic',
    (source) => {
      expect(isAutomaticChange(source)).toBe(true);
    },
  );
});

describe('formatChangeMadeBy', () => {
  it.each([
    ['Siebel', 'Automatic update from US Donation Services'],
    ['US Donation System', 'Automatic update from US Donation System'],
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

  it('falls back when the user is unknown', () => {
    expect(
      formatChangeMadeBy(
        addressChange({ source: 'MPDX' }),
        currentUserId,
        i18n.t,
      ),
    ).toBe('Unknown user, in MPDX');
  });
});

describe('formatMadeByOption', () => {
  const option = (type: AddressChangeMadeByEnum) =>
    mockAddressChangeHistory.madeByOptions.find(
      (madeByOption) => madeByOption.type === type,
    )!;

  it('names raw sources the way the rest of the app does', () => {
    expect(
      formatMadeByOption(
        option(AddressChangeMadeByEnum.Source),
        currentUserId,
        i18n.t,
      ),
    ).toBe('US Donation Services');
  });

  it('labels the current user as "You" and other users by name', () => {
    const [otherUser, currentUser] =
      mockAddressChangeHistory.madeByOptions.filter(
        (madeByOption) => madeByOption.type === AddressChangeMadeByEnum.User,
      );

    expect(formatMadeByOption(currentUser, currentUserId, i18n.t)).toBe('You');
    expect(formatMadeByOption(otherUser, currentUserId, i18n.t)).toBe(
      'Jane Smith',
    );
  });

  it('uses its own translated label for unknown users', () => {
    expect(
      formatMadeByOption(
        { ...option(AddressChangeMadeByEnum.UnknownUser), label: 'unknown' },
        currentUserId,
        i18n.t,
      ),
    ).toBe('Unknown user');
  });
});

describe('groupMadeByOptions', () => {
  it('splits sources from people and labels each one', () => {
    expect(
      groupMadeByOptions(
        mockAddressChangeHistory.madeByOptions,
        currentUserId,
        i18n.t,
      ),
    ).toEqual({
      automatic: [
        { value: 'source:Siebel', label: 'US Donation Services' },
        { value: 'source:DataServer', label: 'DonorHub' },
        { value: 'source:US Donation System', label: 'US Donation System' },
      ],
      mpdx: [
        { value: 'user:user-2', label: 'Jane Smith' },
        { value: 'user:user-1', label: 'You' },
        { value: 'unknown_user', label: 'Unknown user' },
      ],
    });
  });
});

describe('getChangedDuringRange', () => {
  const nowMillis = Settings.now;
  beforeEach(() => {
    Settings.now = () => new Date(2026, 9, 14, 15).valueOf();
  });
  afterEach(() => {
    Settings.now = nowMillis;
  });

  it.each([
    [ContactFilterChangedDuringEnum.Last3Months, '2026-07-14'],
    [ContactFilterChangedDuringEnum.Last6Months, '2026-04-14'],
    [ContactFilterChangedDuringEnum.Last12Months, '2025-10-14'],
  ])('turns %s into a range ending today', (changedDuring, startDate) => {
    const range = getChangedDuringRange(changedDuring, null);

    expect(range?.startDate?.toISODate()).toBe(startDate);
    expect(range?.endDate?.toISODate()).toBe('2026-10-14');
  });

  it('uses the custom range for Custom', () => {
    const customRange = {
      startDate: DateTime.local(2026, 1, 1),
      endDate: null,
    };

    expect(
      getChangedDuringRange(ContactFilterChangedDuringEnum.Custom, customRange),
    ).toBe(customRange);
  });

  it('returns no range when nothing is chosen', () => {
    expect(getChangedDuringRange(null, null)).toBeNull();
  });
});
