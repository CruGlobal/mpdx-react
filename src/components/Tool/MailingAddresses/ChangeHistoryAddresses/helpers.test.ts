import { DateTime, Settings } from 'luxon';
import { AddressChangeMadeByEnum } from 'src/graphql/types.generated';
import i18n from 'src/lib/i18n';
import { mockAddressChangeHistory } from './ChangeHistoryAddressesMock';
import {
  ContactFilterChangedDuringEnum,
  formatMadeByOption,
  getChangedDuringRange,
  groupMadeByOptions,
} from './helpers';

const currentUserId = 'user-1';

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
