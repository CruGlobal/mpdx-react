import { DateTime } from 'luxon';
import { TFunction } from 'react-i18next';
import {
  Address,
  AddressChange,
  ContactFilterPartnerEnum,
} from 'src/graphql/types.generated';
import { manualSourceValue, sourceToStr } from 'src/lib/sourceHelper';

export const formatPartnerFilter = (
  partner: ContactFilterPartnerEnum,
  t: TFunction,
): string => {
  const labels: Record<ContactFilterPartnerEnum, string> = {
    [ContactFilterPartnerEnum.GaveOneOrMore]: t('Gave One or More Gifts'),
    [ContactFilterPartnerEnum.GaveLastTwoYears]: t('Gave in the Last 2 Years'),
    [ContactFilterPartnerEnum.Lost]: t('Lost Partners'),
  };
  return labels[partner];
};

export enum ContactFilterChangedDuringEnum {
  Last3Months = 'Last3Months',
  Last6Months = 'Last6Months',
  Last12Months = 'Last12Months',
  Custom = 'Custom',
}

export const formatChangedDuringFilter = (
  changedDuring: ContactFilterChangedDuringEnum,
  t: TFunction,
): string => {
  const labels: Record<ContactFilterChangedDuringEnum, string> = {
    [ContactFilterChangedDuringEnum.Last3Months]: t('Last 3 Months'),
    [ContactFilterChangedDuringEnum.Last6Months]: t('Last 6 Months'),
    [ContactFilterChangedDuringEnum.Last12Months]: t('Last 12 Months'),
    [ContactFilterChangedDuringEnum.Custom]: t('Custom Date Range'),
  };
  return labels[changedDuring];
};

export interface DateRange {
  startDate: DateTime | null;
  endDate: DateTime | null;
}

export type AddressChangeRow = Omit<AddressChange, 'previousAddress'> & {
  previousAddress?: Pick<
    Address,
    'street' | 'city' | 'state' | 'postalCode'
  > | null;
};

const usDonationServicesSources = ['Siebel', 'US Donation System', 'US'];

export const formatAddress = ({
  street,
  city,
  state,
  postalCode,
}: Pick<Address, 'street' | 'city' | 'state' | 'postalCode'>): string =>
  [
    street?.replace(/\n/g, ', '),
    city,
    [state, postalCode].filter(Boolean).join(' '),
  ]
    .filter(Boolean)
    .join(', ');

export const isAutomaticChange = (source: string): boolean =>
  source !== manualSourceValue;

export const formatChangeMadeBy = (
  { source, createdByUserId, createdByUserName }: AddressChangeRow,
  currentUserId: string | undefined,
  t: TFunction,
): string => {
  if (isAutomaticChange(source)) {
    const sourceName = usDonationServicesSources.includes(source)
      ? t('US Donation Services')
      : sourceToStr(t, source);
    return t('Automatic update from {{source}}', { source: sourceName });
  }
  const appName = sourceToStr(t, source);
  if (createdByUserId && createdByUserId === currentUserId) {
    return t('You, in {{appName}}', { appName });
  }
  const name = createdByUserName ?? t('Unknown user');
  return t('{{name}}, in {{appName}}', { name, appName });
};
