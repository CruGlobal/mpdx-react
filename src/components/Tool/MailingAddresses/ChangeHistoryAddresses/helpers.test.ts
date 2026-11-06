import {
  AddressChangeMadeByEnum,
  ContactFilterPartnerEnum,
} from 'src/graphql/types.generated';
import i18n from 'src/lib/i18n';
import { mockAddressChangeHistory } from './ChangeHistoryAddressesMock';
import {
  formatMadeByOption,
  formatPartnerFilter,
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
    ).toBe('Not recorded (before Nov 2026)');
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
      ],
      mpdx: [
        { value: 'user:user-2', label: 'Jane Smith' },
        { value: 'user:user-1', label: 'You' },
        { value: 'unknown_user', label: 'Not recorded (before Nov 2026)' },
      ],
    });
  });
});

describe('formatPartnerFilter', () => {
  it.each([
    [ContactFilterPartnerEnum.GaveOneOrMore, 'All Partners'],
    [ContactFilterPartnerEnum.GaveLastTwoYears, 'Gave in the Last 2 Years'],
    [ContactFilterPartnerEnum.Lost, 'Lost Partners'],
  ])('labels %s as "%s"', (partner, label) => {
    expect(formatPartnerFilter(partner, i18n.t)).toBe(label);
  });
});
